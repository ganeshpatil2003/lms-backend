class ApiResponse {
    constructor(statuscode,data,message ="success"){
        this.statuscode = statuscode;
        this.data = data;
        this.message = message;
        this.successcode = statuscode <400;
    }
}

export {ApiResponse}