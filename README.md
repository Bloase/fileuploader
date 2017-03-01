# fileuploader
File uploader component in Angular2 

##Installation

recommended way to install is through [npm](https://www.npmjs.com/package/fileuploader) package manager using the command: 
```bash
npm install fileuploader --save
```

##Documentation

###Inputs

-`type` (`string`) - used to identify how the files will be handled, currently only image has particular handling
-`cpntID` (`string`) - the id of the component, used to facilitate testing
-`accepted` (`string`) - a string that dictates which types of archives will show up on the upload dialog
-`maxSize` (`number`) - the maximum size a file can have to be allowed, expressed in bytes i.e: 1000 = 1 kb
-`multiple` (`boolean`) - if the component will take multiple files, default is true
-`encode` (`boolean`) - if the component will generate a base64 string of the uploaded files, default false

###Outputs

-`results` : currently only used for image type inputs
-`fail` : A string containing the names of all files that couldn't be uplaoded, normally caused if the file is over the maxSize

###Fields

-`files` (`File[]`) : holds the files uploaded to the component, used if the multiple input is set to true
-`mFile` (`File`) : holds the single file uploaded, used when multiple is set to false
-`encoded` (`string[]`) : holds the base64 of all files uploaded to the component, empty if encode = false;
-`failed` (`string[]`) : holds the names of all files that failed to upload;
