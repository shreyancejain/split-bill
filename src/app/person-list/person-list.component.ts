import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AppService } from '../app.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss']
})
export class PersonListComponent implements OnInit {

  public personFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-Z ]*')
  ]);

  matcher = new MyErrorStateMatcher();
  public peopleList:any;

  onSubmit() {
    this.appService.addPerson(this.personFormControl.value).subscribe(
      res => {
        this.getPeopleList();
        this.personFormControl.reset();
        this.personFormControl.setErrors(null);
        console.log('Person Added', res)
      },
      err => {
        this.openSnackBar(err)
      }
    );
  }

  openSnackBar(message: string) {
    let config = new MatSnackBarConfig();
    config.panelClass = ['alert-error'];
    config.verticalPosition = 'top'
    config.duration = 1000
    this._snackBar.open(message, undefined, config);
  }

  constructor(private appService: AppService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getPeopleList();
  }

  getPeopleList (){
    this.peopleList = this.appService.getPeopleList()
  }

}
