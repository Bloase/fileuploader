import { FileDropDirective } from './components/filedrop.directive';
import { UploaderComponent } from './components/uploader.component';
import { UploaderWithFileComponent } from './components/uploaderwithfile.component';
import { UploaderWithoutFileComponent } from './components/uploaderwithoutfile.component';

export default {
    directives: [
        FileDropDirective
    ]
};

export { FileUploaderModule } from './components/fileuploader.module';