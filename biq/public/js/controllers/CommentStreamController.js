/**
 * @class CommentStream
 * @module Sentrana
 * @namespace Sentrana.Controllers
 * @extends jQuery.Controller
 * @description This class is a controller that renders the comment stream and handles user
 * events associated with it.
 */
can.Control.extend("Sentrana.Controllers.CommentStream", {

    pluginName: 'sentrana_comment_stream',

    defaults: {
        app: null,
        /* This is assumed to be an instance of Sentrana.Controllers.BIQController */
        commentStreamModel: null,
        /* This is assumed to be an instance of Sentrana.Models.CommentStream */
        addButtonCss: ".add-comment-btn",
        inputTextCss: 'textarea[name="comment-text"]',
        commentsCss: ".comments",
        commentsHeaderArea: ".comments-header-area",
        templateFile: "templates/comments.ejs"
    }
}, {
    // Constructor...
    init: function () {
        // Update our view!
        this.updateView();
        this.deleteCommentDlg = $("#delete-comment-dialog").sentrana_dialogs_delete_comment({}).control();

        this.editCommentDlg = $("#edit-comment-dialog").sentrana_dialogs_edit_comment({
            parent: this
        }).control();
    },

    // Instance Method: Options have been updated...
    update: function (options) {
        this._super(options);
        this.updateView();
    },

    // Instance Method: Update the view...
    updateView: function () {
        // Locate DOM elements...
        this.$addButton = this.element.find(this.options.addButtonCss);
        this.$inputText = this.element.find(this.options.inputTextCss);
        this.$comments = this.element.find(this.options.commentsCss);
        this.$commentsHeaderArea = this.element.find(this.options.commentsHeaderArea);

        this.$commentsHeaderArea.css('display', 'block');
        // Initially disable the add comment button
        this.$addButton.button("disable");
        this.$addButton.addClass("disabled");
        this.element.find('.comments-menu-item').removeClass('item-selected');
        this.element.find('.comments-menu-item.creation-date').addClass('item-selected');
        // Do we have a model and comments?
        if (this.options.commentStreamModel && this.options.commentStreamModel.hasComments()) {
            // Replace the comments...
            this.$comments.html(can.view(this.options.templateFile, this.options.commentStreamModel.getComments())).show();
            this.updateCommentCountView();
        }
        else {
            this.$comments.empty().hide();
            this.updateCommentCountView();
        }
    },

    updateCommentCountView: function (commentStreamModel) {
        var model = commentStreamModel ? commentStreamModel : this.options.commentStreamModel;

        if (model && model.hasComments()) {
            // Replace the comments...
            var commentCount = model.comments.length * 1;
            if (commentCount === 1) {
                $('.total-user-comments').text('You have ' + commentCount + ' comment');
            }
            else {
                $('.total-user-comments').text('You have ' + commentCount + ' comments');
            }

        }
        else {
            $('.total-user-comments').text('You do not have any comment');
            this.$comments.empty().hide();
        }
    },

    ".comment-button-container click": function (el, ev) {
        var element = $(el);
        var that = this;
        var btnElement;
        if (element.hasClass('edit')) {
            btnElement = element.children(".btn-comment-edit");
            that.editCommentDlg.open(that.getSelectedComment(btnElement), this.options.commentStreamModel);
        }
        else if (element.hasClass('delete')) {
            btnElement = element.children(".btn-comment-delete");
            that.deleteCommentDlg.open(that.getSelectedComment(btnElement), this.options.commentStreamModel);
        }
    },

    getSelectedComment: function (el) {
        var commentId = $(el).parent().attr('id');
        var comment = $.grep(this.options.commentStreamModel.comments, function (c) {
            return c.cid === commentId;
        });
        comment[0].id = comment[0].cid;
        return comment[0];
    },

    // Event Handler: What to do when a user enters text in the Comment Stream input box...
    '{inputTextCss} keyup': function (el, ev) {
        this.handleInputTexEvent(el, ev);
    },

    '{inputTextCss} paste': function (el, ev) {
        var that = this;
        setTimeout(function () {
            that.handleInputTexEvent(el, ev);
        }, 400);

    },

    '{inputTextCss} cut': function (el, ev) {
        var that = this;
        setTimeout(function () {
            that.handleInputTexEvent(el, ev);
        }, 400);
    },

    handleInputTexEvent: function (el, ev) {

        // Enable (or disable) the ADD button...
        this.$addButton.button((el.val()) ? "enable" : "disable");
        if (el.val()) {
            this.$addButton.removeClass('disabled');
        }
        else {
            this.$addButton.addClass('disabled');
        }

        // If we have no text, get out...
        if (!el.val()) {
            return;
        }

        // Is this a return character?
        if (ev.ctrlKey && ev.keyCode === 13) {
            this.$addButton.trigger("click");
        }
    },

    refreshComments: function (commentStreamModel) {
        // Redraw the comments...
        var selecctedSortOrder = $('.comments-menu-item.item-selected').attr('type');
        commentStreamModel.sortItem(selecctedSortOrder);
        this.$comments.html(this.options.templateFile, commentStreamModel.getComments()).show();
        this.updateCommentCountView(commentStreamModel);
    },

    ".comments-menu-item  click": function (el, ev) {
        if ($(el).hasClass('item-selected')) {
            return;
        }

        // Sort and Redraw the comments...
        this.options.commentStreamModel.sortItem($(el).attr('type'));
        this.$comments.html(this.options.templateFile, this.options.commentStreamModel.getComments()).show();

        $('.comments-menu-item').removeClass('item-selected');
        $(el).addClass('item-selected');
    },

    // Event Handler: What to do when the user clicks the button to add text to the comment stream...
    "{addButtonCss} click": function (el, ev) {
        // Is this button enabled?
        if (el.button("option", "disabled") === true) {
            return;
        }

        if ($.trim(this.$inputText.val()).length <= 0) {
            this.$inputText.val("").focus();
            this.$addButton.button("disable");
            this.$addButton.addClass("disabled");
            return;
        }
        // Ask the CommentStream model to create a new item...
        this.options.commentStreamModel.addCommentItem({
            "msg": this.$inputText.val()
        });

        // Clear the input...
        this.$inputText.val("").focus();
        this.$addButton.button("disable");
        this.$addButton.addClass("disabled");
    },

    ".comment hover": function (el) {
        var commentEditSection = $('.comment-edit', el);
        if (commentEditSection) {
            commentEditSection.css('visibility', 'visible');
        }
    },

    ".comment mouseleave": function (el) {
        var commentEditSection = $('.comment-edit', el);
        if (commentEditSection) {
            commentEditSection.css('visibility', 'hidden');
        }
    },

    // Synthetic Event: Model has been updated...
    "{commentStreamModel} change": function (commentStreamModel, ev, attr, how, newVal, oldVal) {
        // Has the count changed?
        if (attr === "count") {
            this.refreshComments(commentStreamModel);
        }
    }
});
