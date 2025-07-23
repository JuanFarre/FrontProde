import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEliminarEntidadComponent } from './dialog-eliminar-entidad.component';

describe('DialogEliminarEntidadComponent', () => {
  let component: DialogEliminarEntidadComponent;
  let fixture: ComponentFixture<DialogEliminarEntidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogEliminarEntidadComponent]
    });
    fixture = TestBed.createComponent(DialogEliminarEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
