$(function() {
    $(".forum-sidebar .sticky").css('width', $(".forum-sidebar .sticky").width()-2);
    $(".forum-sidebar .sticky").sticky({topSpacing:45});

    $('.new-thread').on('click', function(e) {
        e.preventDefault();

        $('.forum-container').toggleClass('new-thread');
        if ($('.forum-container').hasClass('new-thread'))
            $(this).html('<i class="icon-caret-left"></i> Thread list');
        else
            $(this).html('<i class="icon-chat"></i> New thread');
    });

    var thread_id = $('div.forum-main').attr('data-thread-id');

    $('.post-watch').on('click', function(e) {
        e.preventDefault();

        watching = $(this).hasClass('post-unwatch');

        $.get('/files/ajax/forum.php', {action: 'watch', thread_id: thread_id, watch: !watching}, function(data) {
            // console.log(data);
        }, 'json');

        if (!watching) {
            $(this).addClass('post-unwatch').html('<i class="icon-eye-blocked"></i> Unwatch');
        } else {
            $(this).removeClass('post-unwatch').html('<i class="icon-eye"></i> Watch');
        }
    });

    // Admin menu
    $('.post-admin-container > a.button').on('click', function(e) {
        e.preventDefault();

        $(this).parent().toggleClass('open');
    });


    $('a.remove').click(function(e) {
        e.preventDefault();
        var $elem = $(this).closest('li');
        var id = $elem.attr('data-id');

        $.confirm({
            title   : 'Delete post',
            message : 'Are you sure you want to delete this message? <br />It cannot be restored at a later time! Continue?',
            buttons : {
                Cancel  : {
                    class: 'cancel'
                },
                Confirm : {
                    action: function(){
                        // Remove item from feed
                        var uri = '/files/ajax/forum.php?action=post.remove&id=' + id;
                        $.getJSON(uri, function(data) {
                            if (data.status) {
                               $elem.slideUp();
                               numbers =$($('.forum-pagination')[0]).clone().children().remove().end().text().match(/[0-9]+/g);
                               // console.log(numbers);
                               $('.forum-pagination').text('Viewing '+(numbers[0]-1)+' replies - '+numbers[1]+' through '+(numbers[2]-1)+' (of '+(numbers[3]-1)+' total)')
                            }
                        });
                    }
                }
            }
        });
    });

    $('a.flag').click(function(e) {
        e.preventDefault();
        var $this = $(this),
        $elem = $(this).closest('li'),
        id = $elem.attr('data-id');

        $.confirm({
            title   : 'Flag post',
            message : 'Are you sure you want to flag this post as inappropriate?',
            buttons : {
                Cancel  : {
                    class: 'cancel'
                },
                Confirm : {
                    action: function(){
                        // Remove item from feed
                        var uri = '/files/ajax/forum.php?action=post.flag&id=' + id;
                        $.getJSON(uri, function(data) {
                            // console.log(data);
                            if (data.status) {
                                $this.html("<i class='icon-flag'></i> Flagged").addClass('flagged').removeClass('flag');
                            }
                        });
                    }
                }
            }
        });
    });



    $('a.karma').on('click', function(e) {
        e.preventDefault();

        var $this = $(this);
        var id = $this.closest('li').attr('data-id');
        var $value = $this.siblings('span');
        var value;

        if ($this.hasClass('karma-up')) {
            var uri = '/files/ajax/forum.php?action=karma.positive&id=' + id;
            value = parseInt($value.text())+1;
        } else {
            var uri = '/files/ajax/forum.php?action=karma.negative&id=' + id;
            value = parseInt($value.text())-1;
        }

        if ($this.hasClass('karma-cancel')) {
            uri += '&cancel';
            if ($this.hasClass('karma-up')) {
                value -= 2;
            } else {
                value += 2;
            }
        } else if ($this.siblings().hasClass('karma-cancel')) {
            if ($this.hasClass('karma-up')) {
                value += 1;
            } else {
                value -= 1;
            }            
        }

        $.getJSON(uri, function(data) {
            if (data['status'] == false)
                return false;

            $value.text(value);
            
            $this.siblings('a').removeClass('karma-cancel');
            $this.toggleClass('karma-cancel');
        });
    });



    $('ul.post-list li').each(function() {
        var self = this;

        if ($(self).find('.post_content .bbcode-youtube').length)
            setTimeout(resizePostInfo(self), 5);
        else if ($(self).find('.post_content .bbcode-vimeo').length)
            setTimeout(resizePostInfo(self), 5);
        else
            resizePostInfo(self)();
    });


    $('.show-post').on('click', function(e) {
        e.preventDefault();

        var $this = $(this).parent(),
            $container = $this.closest('.removed-karma');

        $container.slideUp(function() {
            $this.hide();

            $this.siblings('.post_body').show();
            $container.find('.post_header > *').show();
            $container.find('.post_header a img').show();
            $container.css({backgroundColor: '#1E1E1E'});
            $container.find('.post_header a').removeClass('strong').removeClass('dark');

            resizePostInfo();
            $container.slideDown();
        });

        // $this.fadeOut(function() {
        //     $this.siblings('.post_body').slideDown();
        //     $container.find('.post_header > *').slideDown(function() {
        //         resizePostInfo();
        //     });
        //     $container.find('.post_header a').removeClass('strong').removeClass('dark');
        //     $container.find('.post_header a img').slideDown();
        //     $container.css({backgroundColor: '#1E1E1E'});
        // });
    })


    function resizePostInfo(self) {
        return function() {
            var h = $(self).find('.post_content').height();
            if (h > $(self).find('.post_header').height()) {
                $(self).find('.post_header').height(h-4);
            }
        }
    }
});