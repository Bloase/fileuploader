import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FileDropDirective } from './filedrop.directive';
import { UploaderWithFileComponent } from './uploaderwithfile.component';
import { UploaderWithoutFileComponent } from './uploaderwithoutfile.component';
import * as JSZip from 'jszip';

@Component({
    selector: 'uploader',
    styles: [`
        .uploadContainer {
            background: #F9F9F9;
            outline: dotted 3px #ccc;
            cursor: pointer;
            height: 100%;
            max-height: 100%;
            overflow-y:auto;
        }

        .uploaderWithoutFile {
            max-height: 100%;
            max-width: 100%;
        }

        .uploaderWithFile {
            max-height: 100%;
            max-width: 100%;
        }
    `],
    template:`
    <div class="uploadContainer" [style.outlineColor]="dragging ? 'red' : '#ccc'" fileDropDirective (fileOver)="handleFileOver($event)" (onFileDrop)="handleFileLoad($event)" [ngStyle]="setStyles()">
        <input type="file" #input [hidden]="true" [id]="cpntID" (change)="onChange($event)" multiple="multiple" [accept]="accepted">
        <div *ngIf="!hasFiles()">
            <ng-content select="uploader-without-file" class="uploaderWithoutFile"></ng-content>
        </div>
        <div *ngIf="hasFiles()">
            <ng-content select="uploader-with-file" class="uploaderWithFile"></ng-content>
        </div>
    </div>
    `,
})
export class UploaderComponent {

    @Input() type: string;
    @Input() userImg: string;
    @Input() cpntID: string;
    @Input() accepted: string;
    @Input() maxSize: number = 0;
    @Input() looks: any;
    @Input() multiple: boolean = true;
    @Input() encode: boolean = false;
    @Input() invalidFilemsg: string = 'Invalid File';
    @Input() invalidFormatmsg: string = 'Invalid Format!'; 
    @Output() results: EventEmitter<any> = new EventEmitter();
    @Output() fail: EventEmitter<any> = new EventEmitter();

    dragging: boolean = false;
    public files: File[] = [];
    public mFile: File = null;
    public encoded: string[] = [];
    public imgSrc: string = '';
    public jszip = new JSZip();
    failed = new Array<String>();
    hasFile: boolean = false;
    protected myElement: ElementRef;

    @ViewChild("input") input: ElementRef;

    /**
     * Constructor
     */
    constructor(element: ElementRef) {
        this.myElement = element;
    }

    handleFileOver(event: any) {
        this.dragging = event;
    }

    handleFileLoad(files: any) {
        console.log(files);
        this.dragging = false;
        if (files.length > 0) {


            if (this.type === 'image') {
                let file = files[0];
                this.handleImageLoad(file);
            } else if (this.type === 'invoice') {
                this.handleInvoiceLoad(files);
            } else {
                if(this.multiple) {
                    this.loadMultiple(files);
                } else {
                    this.loadSingle(files[0]);
                }
            }
            if(this.failed.length > 0) {
                let str = this.invalidFilemsg +': ';
                while (this.failed.length > 0) {
                    str += this.failed.pop();
                    if (this.failed.length > 0) {
                        str += ', ';
                    }
                }
                this.fail.emit(str);
                alert(str);
            }
        }
    }

    loadFiles(event: any) {

        let fileList: File[] = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        console.log(fileList);
        this.handleFileLoad(fileList);
    }

    onChange(event: any) {
        console.log(event);
        this.loadFiles(event);
        this.input.nativeElement.value = '';
    }

    addFiles(): void {
        this.input.nativeElement.click();
    }

    handleImageLoad(file: any) {
        let reader = new FileReader();
        if (file.type.match('image/jpeg')) {
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsDataURL(file);
            this.files.push(file);
        } else {
            alert(this.invalidFormatmsg);
            return;
        }
    }

    loadSingle(file: any) {
        if(this.maxSize !== null && this.maxSize > 0) {
            if(file.size > this.maxSize) {
                return;
            }
        }
        if(!this.matchesExtension(file)){
            return;
        }
        this.mFile = file;
        if(this.encode) {
            this.getBase64(file);
        }
        let res: any = new Object();
        res.msg = 'loaded file';
        res.file = this.mFile;
        this.results.emit(res);
    }

    loadMultiple(files: any) {
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {

                let file: File = files[i];
                
                if(this.maxSize !== null && this.maxSize > 0) {
                    if(file.size > this.maxSize) {
                        this.failed.push(file.name);
                        continue;
                    }
                }
                if(!this.matchesExtension(file)) {
                    this.failed.push(file.name);
                    continue;
                }
                this.files.push(file);
                if(this.encode) {
                    this.getBase64(file);
                }
            }
            let res: any = new Object()
            res.msg = 'loaded files';
            res.files = this.files;
            this.results.emit(res);
        }
    }

    cleanFiles() {
        this.input.nativeElement.value = '';
        this.files = [];
    }

    handleInvoiceLoad(files: any) {
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                
                let file: File = files[i];

                if(this.maxSize !== null && this.maxSize > 0) {
                    if(file.size > this.maxSize) {
                        this.failed.push(file.name);
                        continue;
                    }
                }

                if (this.handleExtension(file) == 0) {
                    this.files.push(file);
                    if(this.encode) {
                        this.getBase64(file);
                    }
                } else if (this.handleExtension(file) == 1) {
                    this.jszip.loadAsync(file)
                        .then((configZip: any) => {
                            configZip.forEach((filePath: string, file: JSZipObject) => {
                                if (!file.dir) {
                                    let filename: string = file.name.split('/').pop();
                                    if ((filename.indexOf('.') !== 0)) {
                                        file.async("blob").then((content: Blob) => {
                                            let f = new File([content], filename);
                                            this.files.push(f);
                                            if(this.encode) {
                                                this.getBase64(f);
                                            }
                                        });
                                    }
                                }
                            });
                        });
                } else {
                    this.failed.push(file.name);
                }
            }
            if (this.files.length > 0) {
                this.results.emit(this.files);
            }
            if (this.failed.length > 0) {
                let str = this.invalidFilemsg +': ';
                while (this.failed.length > 0) {
                    str += this.failed.pop();
                    if (this.failed.length > 0) {
                        str += ', ';
                    }
                }
                alert(str);
            }
        }
    }

    private handleExtension(file: File): number {
        let name = file.name.toLowerCase();
        let ext = name.split('.').pop();
        if (ext === 'zip') {
            return 1;
        }
        return 0;
    }

    private matchesExtension(file: File): boolean {
        if(this.accepted.length === 0) {
            return true;
        }
        let ext = file.name.toLowerCase().split('.').pop();
        if(this.accepted.indexOf(ext) !== -1) {
            return true;
        }
        return false;
    }

    _handleReaderLoaded(e: any) {
        let reader = e.target;
        let img = document.createElement("img");
        img.src = reader.result;
        this.imgSrc = this.resize(img);
        this.results.emit(this.imgSrc);
    }

    resize(img: any) {
        let canvas = document.createElement("canvas");

        canvas.width = 100;
        canvas.height = 100;

        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 100, 100);

        let dataUrl = canvas.toDataURL('image/jpeg');

        return dataUrl;
    }

    setStyles() {
        return this.looks;
    }

    getBase64(file: File){
        let reader = new FileReader();
        reader.onload = this.convertbase64.bind(this);
        reader.readAsDataURL(file);
    }

    hasFiles() {
        if(this.multiple) {
            return this.files.length > 0;
        }
        else {
            return this.mFile ? true : false;
        }
    }
    
    convertbase64(e: any) {
        let reader = e.target;
        if(this.multiple) {
            this.encoded.push(reader.result);
        } else {
            this.encoded = [];
            this.encoded.push(reader.result);
        }
    }

    public downloadSingleFile(name?:string, encoded?: boolean) {

        if ((encoded && this.encoded.length > 0) || (this.mFile)) {
            let downloadSingle = document.createElement('a');
            if (encoded) {
                downloadSingle.setAttribute('href', 'application/octet-stream;base64,'+encoded[0]);
            } else {
                let url = window.URL.createObjectURL(this.mFile);
                downloadSingle.href = url;
            }
            downloadSingle.download = name ? name : this.mFile.name;
            document.body.appendChild(downloadSingle);
            downloadSingle.click();
            document.body.removeChild(downloadSingle);
        }
    }

    public downloadFromList(index: number, name?:string, encoded?: boolean) {
        if ((encoded && this.encoded && index < this.encoded.length) || (this.files && index < this.files.length)) {
            let download = document.createElement('a');
            if (encoded) {
                download.setAttribute('href', 'application/octet-stream;base64,'+encoded[index]);
            } else {
                let url = window.URL.createObjectURL(this.files[index]);
                download.href = url;
            }
            download.download = name ? name : this.files[index].name;
            document.body.appendChild(download);
            download.click();
            document.body.removeChild(download);
        }
    }

}