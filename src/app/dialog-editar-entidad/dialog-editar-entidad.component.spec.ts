import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditarEntidadComponent } from './dialog-editar-entidad.component';

describe('DialogEditarEntidadComponent', () => {
  let component: DialogEditarEntidadComponent;
  let fixture: ComponentFixture<DialogEditarEntidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogEditarEntidadComponent]
    });
    fixture = TestBed.createComponent(DialogEditarEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
