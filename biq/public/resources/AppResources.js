var app_resources = {};
app_resources.app_msg = {
    session_time_out: "Session has expired.",
    share_report: {
        deleting_recipients: "Deleting the recipients list...",
        update_recipients: "Updating the recipients list..."
    },
    ajax_error: {
        title: "Error",
        HTTP_0: "Please check your network and services.",
        HTTP_403: "Please log in",
        HTTP_404: "Requested URL not found.",
        HTTP_500: "The server has encountered an unexpected condition which prevented it from fulfilling the request. Please try again later.",
        ParserError: "Invalid data.",
        Timeout: "Request timed out.",
        Abort: "Request aborted.",
        UncaughtError: "The server is currently unavailable. Please try again later.",
        HTTP_503: "The server is currently unavailable. Please try again later.",

        recipient: {
            load: {
                failed: {
                    dialog_title: "Failed to Load Recipient List.",
                    dialog_msg: "Recipients load failed. Please check your Internet connection and try again."
                }
            }
        }
    },
    method_map: {
        no_entry: {
            dialog_title: "No entry in the method map.",
            dialog_msg: "There is no entry in the method map for service method {0}. Please update serviceInfo.json!"
        }
    },
    logout: {
        failed: {
            dialog_title: "INTERNAL ERROR.",
            dialog_msg: "INTERNAL ERROR: Logout failed."
        }
    },
    session_out: {
        dialog_title: "You Have Been Logged Out",
        dialog_msg: "You have been logged out due to inactivity. Please login again if you would like to continue."
    },
    report_definition: {
        column_name_conflict: {
            dialog_title: "Column Name Conflict",
            dialog_msg: "This column name already exists in the report definition."
        },
        execution: {
            required_dialog_title: "Unable to Save",
            required_dialog_msg: "Please execute the report before saving."
        },
        validation: {
            column: {
                required_dialog_title: "No Columns Added",
                required_dialog_msg: "You need to add columns (metrics or attributes) to be able to view the report."
            },
            element: {
                required_dialog_title: "No Elements Selected",
                required_dialog_msg: "You must select at least one element from each of the following attributes to satisfy a valid report definition:\n {0}"
            },
            metrics: {
                already_exists: {
                    dialog_title: "Metric Already Exists",
                    dialog_msg: "This metric already exists in this report."
                }
            },
            attribute: {
                form: {
                    not_selected: {
                        dialog_title: "Select at Least One Attribute Form",
                        dialog_msg: "You must select at least one attribute form. If you do not want any forms displayed for this attribute, please remove it from the report."
                    }
                }
            }
        },
        filter: {
            create_msg: "You can now click on a specific value within one of the filters to create a filtered metric.",
            update_msg: "You can now click on a specific value within one of the filters to modify this filtered metric."
        }
    },
    report_render: {
        error: {
            dialog_title: "INTERNAL ERROR.",
            dialog_msg: "INTERNAL ERROR: Unable to render the report definition: null 'report'"
        }
    },
    repository: {
        not_found: {
            dialog_title: "No Repository Found",
            dialog_msg: "User: {0} does not have access to any repositories"
        },
        loading_error_msg: "Error loading repository. Please report to Administrator",
        loading_with_user_validation_msg: "Validating User and Loading Data Warehouse list, please wait...",
        loading_msg: "Loading Data Warehouse, please wait..."
    },
    save_changes: {
        dialog_title: "Save Changes",
        dialog_msg: "Do you want to save the changes to {0}?"
    },
    booklet: {
        duplicate_report: {
            dialog_title: "Report Already Exists in this Booklet",
            dialog_msg_for_single: "Report {0} already exists in this booklet. Do you want to add another copy?",
            dialog_msg_for_multiple: "Following Report(s) <br/> <br/> {0} <br/><br/> already exist in this booklet. Do you want to add another copy?"
        }
    },
    login: {
        malformed_response: "Internal Error: Malformed Login response. Please report to an administrator.",
        empty_user_name: "Please specify a user name",
        empty_password: "Empty password not allowed",
        email_address_required: "Please specify your email address.",
        unrecognize_identity: "Unrecognized username and password. Please try again.",
        incorrect_emailaddress: "Your email address was not recognized. Please try again or contact your administrator",
        invalid_format_emailaddress: "Invalid format of Email address",
        password_updated: "Your new password has been sent to your email address. Please login using the new password.",
        username_sent: "Your username has been sent to your email address.",
        malformed_response_forgotpassword: "Internal Error:  Please report to Sentrana for investigation."
    },
    update_operation: {
        failed: "Update failed. Check Internet connection and try again."
    },
    save_operation: {
        failed: "Save failed. Check Internet connection and try again."
    },
    delete_operation: {
        failed: "Delete failed. Check Internet connection and try again."
    },
    copy_operation: {
        failed: "Copy failed. Check Internet connection and try again."
    },
    change_password: {
        error_msg: "Password update did not go through. Please try again.",
        success_msg: "Password has been updated successfully. Please log in with your new credentials. Logging out now...",
        wrong_current_password_msg: "Invalid password. Please try again.",
        same_password_msg: "Choose a password you haven't previously used with this account.",
        empty_new_password_msg: "New password cannot be empty.",
        empty_password_msg: "Password field cannot be left blank.",
        password_not_match_msg: "Passwords do not match.",
        invalidPasswordformateMessage: "Invalid password. Valid passwords must contain at least eight characters, no spaces, " +
            "both lowercase and uppercase characters, at least one numeric digit, and at least one special character (any character not 0-9, a-z, A-Z).",
        passwordPolicyViolatedMessage: "Password policy violated. You cannot use recently used 3 passwords as New Password"
    },
    drill_down: {
        key_not_found_msg: "We are unable to get the drill options. The base report can no longer be retrieved. Please re-execute the report and try the drill again.",
        attribute_not_found_msg: "We are unable to parse the set of selected elements for this drill operation. ",
        drill_down_unable_msg: "We are unable to perform a drill with these elements. ",
        cannot_go_deeper_hierarchy: "You cannot drill any deeper<br/>in the hierarchy.",
        cannot_go_deeper_report: "You cannot drill any deeper<br/>into the report.",
        cannot_go_deeper_report_defintion_changed: "You cannot drill down as report definition has been changed.",
        cannot_go_rollup_report_defintion_changed: "You cannot roll up as report definition has been changed.",
        report_defintion_changed_confirm_drill: "Report definition has been changed. Your changes will be lost, Are you sure to drill down?",
        report_defintion_changed_confirm_back: "Report definition has been changed. Your changes will be lost, Are you sure to go back to base report?",
        options: {
            no_data_returned: "No data returned for drill options."
        }
    },
    report_execution: {
        no_data_returned: "No data returned.",
        report_error: "Error",
        success_with_no_data: "No results found.",
        success: "Success.",
        canceled_by_user: "Request was cancelled by the user.",
        large_dataset: "An error occurred while processing your request. You may be trying to return a result set that is too large. Please try refining your query, using either the available filters or column selection and try again.",
        failed: "Failed",
        processing_msg: "Executing..."
    },
    report_load: {
        failed: "Report load failed. Check connection and try again.",
        processing: "Loading saved reports..."
    },
    booklet_load: {
        report_loading_msg: "Loading booklet reports..."
    },
    navigation: {
        redirect_last_page: "Redirecting you to the last accessed page...",
        switch_repository: "Switching data repository, please wait..."
    },
    booklet_operation: {
        create: {
            no_report_error_msg: "Unable to create a booklet because there are no saved reports."
        },
        update: {
            success_msg: "Booklet successfully updated"
        },
        save: {
            processing_msg: "Saving the booklet..."
        },
        remove: {
            processing_msg: "Deleting the booklet...",
            success_msg: "Booklet deleted successfully"
        }
    },
    report_operation: {
        save: {
            processing_msg: "Saving the report..."
        },
        update: {
            success_msg: "Success."
        },
        remove: {
            processing_msg: "Deleting the report..."
        },
        copy: {
            processing_msg: "Copying the report...",
            success_msg: "Report copied successfully"
        }
    },
    derived_column: {
        formula: {
            validating_msg: "Validating formula..."
        },
        validation: {
            empty_column_name_msg: "Column Name cannot be empty!",
            column_cannot_contain_invalid_char: "Column Name cannot contain {0}",
            empty_formula_msg: "Formula cannot be empty!",
            duplicate_column_name: "Column name already in use!"
        }
    },
    comment_operation: {
        remove: {
            processing_msg: "Deleting the comment...",
            confirm_msg: "Please confirm that you would like to delete the following comment:"
        },
        update: {
            processing_msg: "Updating the comment..."
        }
    },
    column_filter: {
        too_many_unique_column: "There are too many unique values to filter",
        slider_not_possible: "There is only one row of data. Slider is not required.",
        no_result: "No items match your search.",
        load_error: "Error loading filter elements."
    },
    report_filter: {
        no_data_returned: "Reverting new filter since it returns no data"
    }
};

app_resources.runTimerBeforeSessionExpireInMinutes = 5;
app_resources.MAX_VIEW_DIALOG_PADDING = 40;
app_resources.UPDATE_SHARING_INFORMATION_IN_SECONDS = 20;
app_resources.print_config = {
    columns_in_page: 4,
    rows_in_page: 22,
    page_orientation: "portrait",
    page_size: "page-size-letter-portrait"
};