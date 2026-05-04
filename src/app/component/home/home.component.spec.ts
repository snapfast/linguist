import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleWordClick', () => {
    it('should clean word and call search', () => {
      const searchSpy = spyOn(component, 'search');

      component.handleWordClick('Hello');
      expect(searchSpy).toHaveBeenCalledWith('hello');

      component.handleWordClick('Latin,');
      expect(searchSpy).toHaveBeenCalledWith('latin');

      component.handleWordClick('(Greek);');
      expect(searchSpy).toHaveBeenCalledWith('greek');

      component.handleWordClick('Etymology...');
      expect(searchSpy).toHaveBeenCalledWith('etymology');
    });
  });
});
