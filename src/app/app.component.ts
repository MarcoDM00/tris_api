import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  caselle:{src:string, nascondi:boolean}[] = [];
  linkImgs:string[] = ["", ""];
  turno:number = 1;
  mosse:number = 0;
  win:boolean = false;
  records:Record[] = [];
  error:string = "";

  constructor(private server: HttpClient) {
    for (let i = 0; i < 9; i++) {
      this.caselle.push({src:"", nascondi:true});
    }
    this.turno = Math.floor(Math.random() * 2);
    this.getLink().subscribe(
      res => {
        this.linkImgs[0] = res['message'];
        do {
          this.getLink().subscribe(
            res => this.linkImgs[1] = res['message'],
            err => this.error = err
          );
        } while (this.linkImgs[0] == this.linkImgs[1]);
      },
      err => this.error = err
    );
    this.getRecords();
  }

  click(id:number) {
    if (this.win) return;
    if (this.caselle[id].src != "") return;
    this.caselle[id].src = this.linkImgs[this.turno];
    this.caselle[id].nascondi = false;
    this.mosse++;
    this.controllo();
    if (!this.win) this.turno = this.turno == 0 ? 1 : 0;
  }

  controllo() {
    for (let i = 0; i < 7; i+=3) {
      if (this.caselle[i].src == "") continue;
       if (this.caselle[i].src == this.caselle[i+1].src && this.caselle[i].src == this.caselle[i+2].src) this.vinto();
    }
    for (let i = 0; i < 3; i++) {
      if (this.caselle[i].src == "") continue;
      if (this.caselle[i].src == this.caselle[i+3].src && this.caselle[i].src == this.caselle[i+6].src) this.vinto();
    }
    if (this.caselle[0].src != "") {
      if (this.caselle[0].src == this.caselle[4].src && this.caselle[0].src == this.caselle[8].src) this.vinto();
    }
    if (this.caselle[2].src != "") {
      if (this.caselle[2].src == this.caselle[4].src && this.caselle[2].src == this.caselle[6].src) this.vinto();
    }
  }

  vinto() {
    setTimeout(() => {
      this.win = true;
      window.scrollTo(0, 0);
    }, 1000);
  }

  reset() {
    this.win = false;
    for (let i = 0; i < 9; i++) {
      this.caselle[i].src = "";
      this.caselle[i].nascondi = true;
    }
    this.turno = Math.floor(Math.random() * 2);
    this.mosse = 0;
  }

  getLink() {
    return this.server.get("https://dog.ceo/api/breeds/image/random");
  }

  getRecords() {
    this.server.get(`http://localhost/api_tris/get`).pipe(
      map((res: any) => {return res['data'];})
    ).subscribe(
      (data: Record[]) => {
        this.records = data;
      },
      (err) => {
        this.error = err.error;
      }
    );
  }
}

export class Record {
  id?: number;
  win: number;
  nMosse: number;
  data: string;
}