/* Progress status Backbone View
 * Displays a progress bar and associated log entries
 * Has no associated model, just does the fetching of data itself
 *
 * Fetches progress data from the server every 2 seconds.
 *
 *   new ProgressView({
 *      name: "progressbarname",
 *      el: $('element to attach it to')
 *   });
 *
 * Depends on jQuery and Backbone.
 */
(function(window, $, Backbone) {
"use strict";

window.ProgressView = Backbone.View.extend({
    events: {
        'click #toggle_progress_log_display_btn': 'togglelogview'
    },
    initialize: function(options) {
        this.name     = options.name;
        this.server   = options.server;
        this.logs     = [];
        this.progress = 0;

        // create the elements
        // should probably template this, but it's so small...
        var els = '<progress max="100" min="100" value="0"></progress>' +
                  '<span id="progress_view_text_value">&nbsp;0%</span>' +
                  '<br />' +
                  '<a href="#" id="toggle_progress_log_display_btn">Show Progress Log</a>' +
                  '<div id="progress_log_view_div" style="display:none;overflow-y:scroll; max-height:100px"></div>';
        this.$el.append(els);

        this.monitorProgress();

        return this.render();
    },
    render: function() {
        this.$el.children('progress').attr('value', this.progress);
        var $text = this.$el.children('span');
        $text.text(' '+ this.progress + '%');

        var content = [];
        this.logs.reverse().forEach(function(log) {
            var entry = $('<div class="info">' + log + '</div>');
            content.push(entry);
        });
        content.push('<div class="info">Started: ' + this.start_time  + '</div>');

        var log = this.$el.children('div');
        log.html('');
        log.append(content);

        if ( this.progress === 100 ) {
            log.prepend('<div class="info">Ended: ' + this.current_time  + '</div>');
            $text.append('  - Complete!');
        }

        this.$el.show();
        
        return this;
    },
    togglelogview: function() {
        $('#progress_log_view_div').toggle();
    },
    monitorProgress: function() {
        var $this = this;
        var url = '/_progress_status/' + $this.name;
        if ( $this.server ) {
            url = $this.server + url;
        }
        setTimeout(function() {
            $.getJSON(url, function(data) {
                if ( data.error ) {
                    console.error(data.error);
                    return;
                }
                var progress = Math.round((data.count / data.total) * 100);
                $this.progress = progress;
                $this.logs = data.messages;
                $this.start_time = new Date(data.start_time * 1000).toISOString();
                $this.current_time = new Date(data.current_time * 1000).toISOString();
                $this.render();
                if ( !data.in_progress || progress === 100 ) {
                    return;
                }
                return $this.monitorProgress();
            });
        },
        2000);
    }
});
})(this, jQuery, Backbone);
