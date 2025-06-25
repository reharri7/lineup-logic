require 'rails_helper'

RSpec.describe "Players", type: :request do
  describe "GET /index," do
    it "returns http success" do
      get "/player/index,"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show," do
    it "returns http success" do
      get "/player/show,"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create," do
    it "returns http success" do
      get "/player/create,"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /update," do
    it "returns http success" do
      get "/player/update,"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy" do
    it "returns http success" do
      get "/player/destroy"
      expect(response).to have_http_status(:success)
    end
  end

end
