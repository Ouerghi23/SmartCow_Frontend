import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CowDetailsComponent } from './cow-details.component';

describe('CowDetailsComponent', () => {
  let component: CowDetailsComponent;
  let fixture: ComponentFixture<CowDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CowDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
