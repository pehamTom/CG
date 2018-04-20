//global object that keeps track of time information
var timer = {elapsed: 0, delta:0, offSet:0, prev:0, absolute:0,
            reset: function() {
                this.offSet = this.absolute;
                this.elapsed = 0;
                this.delta = 0;
            },
            advance: function(timeInMilliseconds) {
                if(isNaN(timeInMilliseconds)) return;
                this.absolute = timeInMilliseconds;
                this.prev = this.elapsed;
                this.elapsed = timeInMilliseconds - this.offSet;
                this.delta = this.elapsed - this.prev;
            }
}
