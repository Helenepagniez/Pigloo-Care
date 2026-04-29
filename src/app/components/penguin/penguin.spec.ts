import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Penguin } from './penguin';

describe('Penguin', () => {
  let component: Penguin;
  let fixture: ComponentFixture<Penguin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Penguin],
    }).compileComponents();

    fixture = TestBed.createComponent(Penguin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
