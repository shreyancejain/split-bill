import { TestBed } from '@angular/core/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppService]
    });
    service = TestBed.get(AppService); // * inject service instance
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add person', () => {
    const personName = 'ROHIT';
    // * act
    service.addPerson(personName);

    // * assert
    expect(service.getPerson(personName).name).toBe(personName);
  });

  it('should add expanse', (done: DoneFn) => {
    const people = ['ROHIT', 'RAHUL', 'SHREYANCE'];
    people.forEach(person => service.addPerson(person));
    const byPerson = people.shift();
    const amount = 200;

    service.addExpense(amount, byPerson, people);

    const addedTransactions = service.getAllTransactions(); // get an Observable
    addedTransactions.subscribe(transactions => {
      expect(transactions[0].by).toBe(byPerson);
      expect(transactions[0].amount).toBe(amount);
      expect(transactions[0].withPeople).toEqual(people);
      done();
    });
  });
});
