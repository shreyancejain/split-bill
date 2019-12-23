import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { AppService } from '../app.service';
import { MatChipInputEvent, MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss']
})
export class BalanceSheetComponent implements OnInit {
  @ViewChild('withInput', { static: false }) withInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoForWith', { static: false }) matAutocomplete: MatAutocomplete;

  balanceSheetFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-Z]*')
  ]);

  expenseForm: FormGroup;
  isLoading: boolean;
  isSettleUp: boolean = false;
  filteredUsers: any;
  paidByUsers: any;
  withUsers: any;
  persons: any = [];
  transactions: any = [];
  displayedColumns: string[] = ['amount', 'by', 'withPeople', 'toPerson', 'isSettleUp'];

  constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private appService: AppService) { }


  ngOnInit(): void {
    let queryParams = this.route.snapshot.queryParams;
    this.isSettleUp = !!queryParams.isSettleUp;
    let by: any = this.appService.getPerson((queryParams.by || '').trim())
    by = by ? by.name : ''
    let to = this.appService.getPerson((queryParams.to || '').trim())
    if (to) {
      this.persons.push(to.name);
    }

    this.expenseForm = this.formBuilder.group({
      'amount': [Number(queryParams.amount), [Validators.required, Validators.min(1)]],
      'paidBy': [by, Validators.required],
      'with': [''],
      // 'description': ['']
    });

    this.getAllTransactions()
    this.expenseForm
      .get('paidBy')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.appService.searchPerson(value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      ).subscribe((users: any) => {
        this.paidByUsers = users
      });

    this.expenseForm
      .get('with')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.appService.searchPerson(value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      ).subscribe((users: any) => {
        this.withUsers = users
      });
  }

  toggleTransactionType(){
    this.isSettleUp = !this.isSettleUp;
    this.persons = [];
  }

  getAllTransactions() {
    this.appService.getAllTransactions()
      .subscribe(
        transactions => {
          this.transactions = [...transactions];
        }
      );
  }

  onSubmit(event) {
    if (this.expenseForm.invalid) {
      return;
    }

    let valueObject = this.expenseForm.value
    if (this.isSettleUp) {
      this.appService.settleUpBalance(valueObject.amount, valueObject.paidBy, this.persons[0])
    } else {
      this.appService.addExpense(valueObject.amount, valueObject.paidBy, this.persons)
    }
    event.currentTarget.reset()
    this.persons = [];
    this.getAllTransactions();
  }

  add(event: MatChipInputEvent): void {
    if (this.matAutocomplete.isOpen) {
      return;
    }
    
    const input = event.input;
    const value = event.value;
    if (input) {
      input.value = '';
    }
    this.expenseForm.get('with').setValue('');

    if (this.isSettleUp && this.persons.length) {
      return;
    }

    let person = this.appService.getPerson((value || '').trim())
    if (person) {
      this.persons.push(person.name);
    }
  }

  remove(fruit: string): void {
    const index = this.persons.indexOf(fruit);

    if (index >= 0) {
      this.persons.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let val = event.option.viewValue;
    this.withInput.nativeElement.value = '';
    this.expenseForm.get('with').setValue('');
    if (this.isSettleUp && this.persons.length) {
      return;
    }
    this.persons.push(val);
  }

}