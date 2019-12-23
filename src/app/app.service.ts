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

  private balances: {
    amount: number,
    // description: string,
    by: string,
    withPeople?: string[],
    toPerson?: string,
    isSettleUp: boolean
  }[] = [];

  constructor() { }

  addPerson(name) {
    name = name.toUpperCase();
    if (this.personsObject[name]) {
      return throwError('Person already Added');
    }
    this.personsObject[name] = {
      name,
      oweFrom: {}
    };
    return of('Person Added Successfully');
  }

  addExpense(amount: number, by: string, withPeople: string[]) {
    if (!amount || !this.isPersonExist(by) || !this.isPeopleExist(withPeople)) {
      return 'Missing or invalid parameters';
    }
    if (withPeople.includes(by)) {
      return 'Invalid parameters';
    }
    const equalShare = Number((amount / (withPeople.length + 1)).toFixed(2));
    withPeople.forEach((person) => {
      this.setOweFrom(equalShare, by, person);
    });
    this.balances.push({ amount, by, withPeople, isSettleUp: false });
  }

  settleUpBalance(amount: number, by: string, toPerson: string) {
    if (!amount || !this.isPersonExist(by) || !this.isPersonExist(toPerson)) {
      return 'Missing or invalid parameters';
    }
    by = by.trim();
    toPerson = toPerson.trim();
    if (by === toPerson) {
      return 'Invalid parameters';
    }
    this.setOweFrom(amount, by, toPerson);
    this.balances.push({ amount, by, toPerson, isSettleUp: true });
  }

  private setOweFrom(amount: number, by: string, toPerson: string) {
    this.personsObject[by].oweFrom[toPerson] = this.personsObject[by].oweFrom[toPerson] || 0;
    this.personsObject[by].oweFrom[toPerson] -= amount;

    this.personsObject[toPerson].oweFrom[by] = this.personsObject[toPerson].oweFrom[by] || 0;
    this.personsObject[toPerson].oweFrom[by] += amount;
  }

  searchPerson(str: string, excludePeople?: string[]) {
    if (!str) {
      return of([]);
    }
    str = str.toUpperCase();
    excludePeople = excludePeople || [];
    return of(Object.keys(this.personsObject)).pipe(
      map(people => people.filter(person => {
        return person.match(new RegExp('.*' + str + '.*')) && !excludePeople.some(excludePerson => excludePerson.trim().toUpperCase() === person);
      }))
    );
  }

  getPerson(name: string) {
    if (!name) {
      return;
    }
    name = name.trim().toUpperCase();
    return this.personsObject[name];
  }

  getPeopleList() {
    return Object.values(this.personsObject);
  }

  isPersonExist(name: string) {
    name = (name || '').toUpperCase();
    return Boolean(this.personsObject[name]);
  }

  isPeopleExist(names: string[]) {
    return Boolean(names && names.length && !names.some(name => !this.isPersonExist(name)));
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
