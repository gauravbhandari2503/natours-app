class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);  // regular expression g flag means that it will change all the occurence.
        this.query = this.query.find(JSON.parse(queryString))

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' '); 
            this.query = this.query.sort(sortBy);   // it takes multiple field with space
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)  //expects strings with spaces , also know as projecting and if something with - is passed then those fields are excluded
        } else {
            this.query = this.query.select('-__v'); 
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1 ;
        const limit = this.queryString.limit * 1 || 10 ;
        const skipValue = (page - 1 ) * limit
        this.query = this.query.skip(skipValue).limit(limit);

        return this;
    }
}


module.exports = APIFeatures;