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
  isSettleUp = false;
  filteredUsers: any;
  paidByUsers: any;
  withUsers: any;
  persons: string[] = [];
  transactions: any = [];
  displayedColumns: string[] = ['amount', 'by', 'withPeople', 'toPerson', 'isSettleUp'];

  constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private appService: AppService) { }


  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParams;
    this.isSettleUp = !!queryParams.isSettleUp;
    let by: any = this.appService.getPerson((queryParams.by || '').trim());
    by = by ? by.name : '';
    const to = this.appService.getPerson((queryParams.to || '').trim());
    if (to) {
      this.persons.push(to.name);
    }

    this.expenseForm = this.formBuilder.group({
      amount: [Number(queryParams.amount) || '', [Validators.required, Validators.min(1)]],
      paidBy: [by, Validators.required],
      withPersons: [this.persons, [this.validateArrayNotEmpty]],
      with: ['']
    });

    this.getAllTransactions();
    this.expenseForm
      .get('paidBy')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.appService.searchPerson(value, this.persons)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
          )
        )
      ).subscribe((users: any) => {
        this.paidByUsers = users;
      });

    this.expenseForm
      .get('with')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.appService.searchPerson(value, [this.expenseForm
          .get('paidBy').value, ...this.persons])
          .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
          )
        )
      ).subscribe((users: any) => {
        this.withUsers = users;
      });
  }

  validateArrayNotEmpty(c: FormControl) {
    if (c.value && c.value.length === 0) {
      return {
        validateArrayNotEmpty: { valid: false }
      };
    }
    return null;
  }

  toggleTransactionType() {
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

  validatePerson(input) {
    const value = (input.value || '').trim();
    if (!this.appService.isPersonExist(value)) {
      input.value = '';
    }
  }

  onSubmit(event) {
    this.expenseForm.controls.withPersons.markAsTouched();
    if (this.expenseForm.invalid) {
      return;
    }

    const valueObject = this.expenseForm.value;
    if (this.isSettleUp) {
      this.appService.settleUpBalance(valueObject.amount, valueObject.paidBy, this.persons[0]);
    } else {
      this.appService.addExpense(valueObject.amount, valueObject.paidBy, this.persons);
    }
    event.currentTarget.reset();
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

    const person = this.appService.getPerson((value || '').trim());
    if (person) {
      this.persons.push(person.name);
      this.expenseForm.controls.withPersons.setValue(this.persons);
      this.expenseForm.controls.withPersons.markAsDirty();
    }
  }

  remove(person: string): void {
    const index = this.persons.indexOf(person);

    if (index >= 0) {
      this.persons.splice(index, 1);
      this.expenseForm.controls.withPersons.setValue(this.persons);
      this.expenseForm.controls.withPersons.markAsDirty();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const val = event.option.viewValue;
    this.withInput.nativeElement.value = '';
    this.expenseForm.get('with').setValue('');
    if (this.isSettleUp && this.persons.length) {
      return;
    }
    this.persons.push(val);
    this.expenseForm.controls.withPersons.setValue(this.persons);
    this.expenseForm.controls.withPersons.markAsDirty();
  }

}
