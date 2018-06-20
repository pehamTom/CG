/**
* Global object that is used for time information.
**/
var timer = {elapsed: 0, delta:0, offSet:0, prev:0, absolute:0,
            reset: function() {
                this.offSet = this.absolute;
                this.elapsed = 0;
                this.delta = 0;
            },
            advance: function(timeInMilliseconds) {
                if(isNaN(timeInMilliseconds)) return; //in the first frame the timeInMilliseconds might be NaN
                this.absolute = timeInMilliseconds;
                this.prev = this.elapsed;
                //if timer was reset, we need to subtract the time of reset from
                //the total elapsed time (time since program started)
                this.elapsed = timeInMilliseconds - this.offSet;
                this.delta = this.elapsed - this.prev;
            }
}
