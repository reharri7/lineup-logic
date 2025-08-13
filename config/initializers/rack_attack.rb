# frozen_string_literal: true

# Rack::Attack configuration
# See: https://github.com/rack/rack-attack

Rack::Attack.cache.store = Rails.cache

# Allow all local traffic
Rack::Attack.safelist("allow-localhost") do |req|
  # 127.0.0.1, ::1 and unix socket
  [ "127.0.0.1", "::1" ].include?(req.ip)
end

# Throttle requests to 100 requests per 5 minutes per IP (general safety net)
Rack::Attack.throttle("req/ip", limit: 100, period: 5.minutes) do |req|
  req.ip
end

# Throttle login attempts to 10 req per minute per IP
# Adjust paths here if routes change.
Rack::Attack.throttle("logins/ip", limit: 10, period: 1.minute) do |req|
  if req.post? && req.path.start_with?("/api/login")
    req.ip
  end
end

# Throttle password reset creation to 5 req per hour per IP
Rack::Attack.throttle("password_resets/ip", limit: 5, period: 1.hour) do |req|
  if req.post? && req.path.start_with?("/api/password_resets")
    req.ip
  end
end

# You can also throttle token refreshes if it is sensitive
Rack::Attack.throttle("refresh_token/ip", limit: 20, period: 10.minutes) do |req|
  if req.post? && req.path.start_with?("/api/refresh_token")
    req.ip
  end
end

# Custom response for throttled requests
Rack::Attack.throttled_response = lambda do |env|
  now = Time.now.utc
  match_data = env["rack.attack.match_data"] || {}
  retry_after = match_data[:period].to_i if match_data.is_a?(Hash)

  body = {
    error: "Too Many Requests",
    message: "You have exceeded the rate limit. Please try again later.",
    timestamp: now.iso8601
  }.to_json

  headers = {
    "Content-Type" => "application/json",
    "Retry-After" => retry_after.to_s
  }

  [ 429, headers, [ body ] ]
end

ActiveSupport::Notifications.subscribe("rack.attack") do |name, start, finish, id, payload|
  # Basic log; avoid serializing Rack::Request to prevent recursion / SystemStackError
  safe_payload = payload.dup
  safe_payload.delete(:request)

  Rails.logger.info(
    "[rack-attack] " +
    { name: name, duration_ms: ((finish - start) * 1000.0).round(1), payload: safe_payload }.to_json
  )
end
