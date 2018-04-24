import { Directive, ElementRef, Input, OnChanges, Renderer, SimpleChanges } from '@angular/core';
  
  /**
   * A helper directive to focus buttons. You will only need this if using a custom template
   */
  @Directive({
    selector: '[bloaseFocus]'
  })
  export class Focus implements OnChanges {
  
    @Input() bloaseFocus: boolean;
  
    constructor(private elm: ElementRef) {}
  
    ngOnChanges(changes: SimpleChanges): void {
      if (changes.bloaseFocus && this.bloaseFocus === true) {
        this.elm.nativeElement.focus();
      }
    }
  
  }