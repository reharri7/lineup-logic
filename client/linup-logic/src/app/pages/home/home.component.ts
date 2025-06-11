import { Component, OnInit } from '@angular/core';
import {NavbarComponent} from "../../components/navbar/navbar.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    NavbarComponent
  ],
  standalone: true
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
