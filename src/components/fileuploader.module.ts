import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileDropDirective } from './filedrop.directive';
import { UploaderComponent } from './uploader.component';
import { UploaderWithFileComponent } from './uploaderwithfile.component';
import { UploaderWithoutFileComponent } from './uploaderwithoutfile.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FileDropDirective,
        UploaderComponent,
        UploaderWithFileComponent,
        UploaderWithoutFileComponent
    ],
    exports: [
        FileDropDirective,
        UploaderComponent,
        UploaderWithFileComponent,
        UploaderWithoutFileComponent
    ]
})

export class FileUploaderModule { }