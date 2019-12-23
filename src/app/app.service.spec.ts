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

  it('should return error Missing or Invalid', () => {
    const people = ['ROHIT', 'RAHUL', 'SHREYANCE'];
    const byPerson = people.shift();
    const amount = 200;
    people.forEach(person => service.addPerson(person));

    const errResp = service.addExpense(amount, byPerson, people);
    expect(errResp).toEqual('Missing or invalid parameters')
  });

  it('should return error Invalid', () => {
    const people = ['ROHIT', 'RAHUL', 'SHREYANCE'];
    people.forEach(person => service.addPerson(person));
    const byPerson = people[0];
    const amount = 200;

    const errResp = service.addExpense(amount, byPerson, people);
    expect(errResp).toEqual('Invalid parameters')
  });

  it('should add settlement', (done: DoneFn) => {
    const people = ['ROHIT', 'RAHUL'];
    people.forEach(person => service.addPerson(person));
    const byPerson = people.shift();
    const amount = 200;

    service.settleUpBalance(amount, byPerson, people[0]);

    const addedTransactions = service.getAllTransactions(); // get an Observable
    addedTransactions.subscribe(transactions => {
      expect(transactions[0].by).toBe(byPerson);
      expect(transactions[0].amount).toBe(amount);
      expect(transactions[0].toPerson).toEqual(people[0]);
      expect(transactions[0].isSettleUp).toBeTruthy();
      done();
    });
  });



  it('should search user', (done: DoneFn) => {
    const people = ['ROHIT', 'RAHUL', 'RAJ'];
    people.forEach(person => service.addPerson(person));

    const addedTransactions = service.searchPerson('A', ['RAJ']); // get an Observable
    addedTransactions.subscribe(transactions => {
      expect(transactions.length).toEqual(1);
      expect(transactions[0]).toEqual('RAHUL');
      done();
    });
  });
});
