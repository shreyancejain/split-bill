import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
  public person:any = {};
  constructor(private route: ActivatedRoute, private router: Router, private appService: AppService) {}

  ngOnInit() {
    this.person = this.appService.getPerson(this.route.snapshot.params.name);
    if(!this.person){
      this.person = {
        name: 'rahul',
        oweFrom:{
          sumit:200,
          shwetank: -200
        }
      };
      // this.router.navigate(['/person']);
    }
  }
}
