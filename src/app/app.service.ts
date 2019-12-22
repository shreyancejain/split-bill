import { Injectable } from '@angular/core';
import { of, from, throwError } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private personsObject: {
    [key: string]: {
      name: string,
      oweFrom: {
        [key: string]: number
      }
    }
  } = {};

  private balances: [{
    amount: number,
    // description: string,
    by: string,
    withPeople?: [string],
    toPerson?: string,
    isSettleUp: boolean
  }?] = [];

  constructor() { }

  addPerson(name) {
    name = name.toUpperCase();
    if (this.personsObject[name]) {
      return throwError("Person already Added");
    }
    this.personsObject[name] = {
      name: name,
      oweFrom: {}
    }
    return of("Person Added Successfully");
  }

  addExpense(amount: number, by: string, withPeople: [string]) {
    let equalShare = Number((amount / (withPeople.length + 1)).toFixed(2));
    withPeople.forEach((person) => {
      this.setOweFrom(equalShare, by, person);
    });
    this.balances.push({ amount, by, withPeople, isSettleUp: false })
  }

  settleUpBalance(amount: number, by: string, toPerson: string) {
    this.setOweFrom(amount, by, toPerson);
    this.balances.push({ amount, by, toPerson, isSettleUp: true })
  }

  setOweFrom(amount: number, by: string, toPerson: string) {
    this.personsObject[by].oweFrom[toPerson] = this.personsObject[by].oweFrom[toPerson] || 0;
    this.personsObject[by].oweFrom[toPerson] -= amount;

    this.personsObject[toPerson].oweFrom[by] = this.personsObject[toPerson].oweFrom[by] || 0;
    this.personsObject[toPerson].oweFrom[by] += amount;
  }

  searchPerson(str: string, excludePerson?: string) {
    if (!str) {
      return of([]);
    }
    str = str.toUpperCase();
    excludePerson = (excludePerson || '').toUpperCase();
    return of(Object.keys(this.personsObject)).pipe(
      map(people => people.filter(person => {
        return person.match(new RegExp('.*' + str + '.*')) && (person !== excludePerson)
      }))
    );
  }

  getPerson(name: string) {
    if (!name) {
      return;
    }
    name = name.toUpperCase();
    return this.personsObject[name];
  }

  getPeopleList() {
    return Object.values(this.personsObject);
  }

  isPersonExist(name: string) {
    name = name.toUpperCase();
    return Boolean(this.personsObject[name]);
  }

  getAllTransactions() {
    return of(this.balances);
  }

  getExpanses() {
    return of(this.balances).pipe(
      map(balances => balances.filter(balance => !balance.isSettleUp))
    );
  }

  getSettlements() {
    return of(this.balances).pipe(
      map(balances => balances.filter(balance => balance.isSettleUp))
    );
  }
}
