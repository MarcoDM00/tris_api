import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { io } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  caselle:{src:string, nascondi:boolean}[] = [];
  linkImgs:string[] = ["", ""];
  turno:number = 1;
  mosse:number = 0;
  win:boolean = false;
  records:Record[] = [];
  error:string = "";
  socket = io('http://93.48.224.122:3002');
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  public message2$: BehaviorSubject<string> = new BehaviorSubject('');
  listaDati: number[] = []
  primo = true

  ngOnInit(): void {

    this.getLink().subscribe(
      res => {
        this.linkImgs[0] = res['message'];
        do {
          this.getLink().subscribe(
            res => {
              this.linkImgs[1] = res['message']
              if (this.linkImgs[0] != this.linkImgs[1]){
                this.socket.emit('login', this.linkImgs.toString())
              }
          }
            ,
            err => this.error = err
          );
        } while (this.linkImgs[0] == this.linkImgs[1]);
        //console.log(this.linkImgs)
        //this.socket.emit('login', this.linkImgs)
      },
      err => this.error = err
    );
    
    
    console.log(this.listaDati)
    this.socket.on('login', (arg) => {
      console.log(arg)
      this.message2$.next(arg);
    });
    this.message2$.asObservable().subscribe((message) => {
      if(message != '0'){

        if(this.linkImgs.length==0){
          this.primo = false
        }

        this.linkImgs = message.split(',')
      }
    })

    console.log(this.listaDati)
    this.socket.on('mosse', (arg) => {
      this.message$.next(arg);
    });
    this.message$.asObservable().subscribe((message: string) => {
      if (message.toString() != ""){
        this.listaDati.push(parseInt(message));

        this.listaDati.forEach(c => {
          if(c >= 9){
            this.caselle[c-9].src = this.linkImgs[1]
            this.caselle[c-9].nascondi = false
          }else{
            this.caselle[c].src = this.linkImgs[0]
            this.caselle[c].nascondi = false
          }
        })

      }
      this.controllo()
      console.log(this.listaDati)
      
    })

  }

  constructor(private server: HttpClient) {
    for (let i = 0; i < 9; i++) {
      this.caselle.push({src:"", nascondi:true});
    }
    this.turno = 1
    
    //this.getRecords();
  }

  click(id:number) {
    console.log(this.primo)
    if(this.primo){
      if (this.win) return;
      if (this.caselle[id].src != "") return;
      this.caselle[id].src = this.linkImgs[this.turno];
      this.caselle[id].nascondi = false;
      this.mosse++;
      this.controllo();
      if (!this.win) this.turno = this.turno == 0 ? 1 : 0;
      if(this.primo){
        this.primo = false
      }else{
        this.primo = true
      }
      if (this.turno == 0){
        id += 9
      }
      this.socket.emit('mosse',id);
    //this.getMessage()
    }
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
      this.resetDati()
    }, 1000);
    
  }

  resetDati(){
    for (let i = 0; i < 9; i++) {
      this.caselle[i].src = "";
      this.caselle[i].nascondi = true;
    }
    this.turno = 1
    this.mosse = 0;
    this.listaDati = [] 
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