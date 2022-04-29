import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  caselle:{src:number, nascondi:boolean}[] = [];
  turno:number = 1;
  mosse:number = 0;
  win:boolean = false;
  success:string = "";
  error:string = "";

  constructor(public server: HttpClient) {
    for (let i = 0; i < 9; i++) {
      this.caselle.push({src:0, nascondi:true});
    }
    this.turno = Math.floor(Math.random() * 2) + 1;
    
  }

  click(id:number) {
    if (this.win) return;
    if (this.caselle[id].src != 0) return;
    this.caselle[id].src = this.turno;
    this.caselle[id].nascondi = false;
    this.mosse++;
    this.controllo();
    if (!this.win) this.turno = this.turno == 1 ? 2 : 1;
  }

  controllo() {
    for (let i = 0; i < 7; i+=3) {
      if (this.caselle[i].src == 0) continue;
       if (this.caselle[i].src == this.caselle[i+1].src && this.caselle[i].src == this.caselle[i+2].src) this.vinto();
    }
    for (let i = 0; i < 3; i++) {
      if (this.caselle[i].src == 0) continue;
      if (this.caselle[i].src == this.caselle[i+3].src && this.caselle[i].src == this.caselle[i+6].src) this.vinto();
    }
    if (this.caselle[0].src != 0) {
      if (this.caselle[0].src == this.caselle[4].src && this.caselle[0].src == this.caselle[8].src) this.vinto();
    }
    if (this.caselle[2].src != 0) {
      if (this.caselle[2].src == this.caselle[4].src && this.caselle[2].src == this.caselle[6].src) this.vinto();
    }
  }

  vinto() {
    this.win = true;
    window.scrollTo(0, 0);
  }

  reset() {
    this.win = false;
    for (let i = 0; i < 9; i++) {
      this.caselle[i].src = 0;
      this.caselle[i].nascondi = true;
    }
    this.turno = Math.floor(Math.random() * 2) + 1;
    this.mosse = 0;
  }
}