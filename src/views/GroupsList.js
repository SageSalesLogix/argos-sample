/**
 * Created by JetBrains WebStorm.
 * User: jhershauer
 * Date: 7/11/11
 * Time: 5:18 PM
 * To change this template use File | Settings | File Templates.
 */
/// <reference path="../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../argos-sdk/src/Detail.js"/>

Ext.namespace("Mobile.Sample");

Mobile.Sample.GroupsList = Ext.extend(Sage.Platform.Mobile.List, {
    //Templates
    //
    //Basic content template to show group name and family
    contentTemplate: new Simplate([
        '<h3>{%: $.name %}</h3>',
        '<h4>{%: $.family %}</h4>'
    ]),
    //Wrap the content template and provide the appropriate data properties for context.
    itemTemplate: new Simplate([
        '<li data-action="activateEntry" data-key="{%= $.$key %}" data-family="{%=$.family %}" data-descriptor="{%: $.$descriptor %}">',
        '<div data-action="selectEntry" class="list-item-selector"></div>',
        '{%! $$.contentTemplate %}',
        '</li>'
    ]),
    //View Properties
    id: 'groups_list',
    titleText: 'Groups',
    icon: 'content/images/icons/filter_24.png',
    resourceKind: 'groups',
    queryOrderBy: 'name',
    hashTagQueries: {
        'account': 'upper(family) eq "ACCOUNT"',
        'contact': 'upper(family) eq "CONTACT"'
        },

    formatSearchQuery: function(query) {
        return String.format('upper(name) like "{0}%"', this.escapeSearchQuery(query.toUpperCase()));
    },
    init: function() {
        Mobile.Sample.GroupsList.superclass.init.apply(this, arguments);
        // Empty the toolbar. This is a read-only view.
        this.tools.tbar = [];
    },
    show: function(options) {
        this.setTitle(options && options.title || this.title);

        Mobile.Sample.GroupsList.superclass.show.apply(this, arguments);
    },
    //Modify the query to just fetch the groups that we want to view for now. Note that at this time,
    //the groups endpoint shows multiple versions if not logged in as Admin. Need to filter out the extras.
    createRequest: function() {
        var where = [];
        //This is a special system endpoint.
        var request = Mobile.Sample.GroupsList.superclass.createRequest.call(this)
            .setContractName('system');
        if (request.uri.queryArgs['where']) {
            where.push(request.uri.queryArgs['where']);
        }
        //If logged in as a user, filter out the groups owned by admin, or we'll see duplicates.
        if (App.context.user.$key.toUpperCase() !== "ADMIN")
            where.push('userId ne "ADMIN"');
        //Just show Account and Contact groups for now.
        //upper() doesn't work with in clause.
        where.push('family in ("Account", "ACCOUNT", "Contact", "CONTACT")');
        request.setQueryArg('where', where.join(' and '));
        return request;
    },
    //On selection, show the appropriate group list view based on the family of the selected group.
    activateEntry: function(params) {
        var v;
        if (params.key) {
            if (params.family) {
                if (params.family.toUpperCase() == 'ACCOUNT') {
                    v = App.getView('account_grouplist');
                }
                else if (params.family.toUpperCase() == 'CONTACT') {
                    v = App.getView('contact_grouplist');
                }
            }
            if (v)
                v.show({_groupId: params.key, title: params.descriptor});
        }
    }
});
