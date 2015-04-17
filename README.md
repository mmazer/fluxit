### Fluxit

A simple implementation of React's
[Flux](http://facebook.github.io/flux/docs/overview.html) architecture.

#### Dispatcher

The dispatcher manages all data flow in a Flux application - its only function
is to distribute the action data to the stores which have registered with it.

#### Stores

In a Flux application, stores are responsible for managing the application's
data and state. A store will typically be responsible for a particular domain
in the application.

Store are updated as a result of data dispatched from actions and will emit
change events to any listeners. They register with the dispatcher to signal
their interest in receving action data. Stores may provide an API for reading
data but should not expose methods to update data directly.

#### Actions

Actions are invoked to start the flow of data in the application, either as the
result of user interaction or a web API call. In the React Flux documentation,
there is a distinction between `Action` and `ActionCreator` while in Fluxit, it
is simplified to `Action`. An action is simply a function which takes a data
object with a `type` and payload.

The action will dispatch the data to all registered stores by invoking the
dispatcher.

Note that an action may also perform additional operations on the data by calling
web APIs before dispatching the data.

#### Getting Started

        var Fluxit = require('fluxit');
        Fluxit.initialize();

##### Creating a Dispatcher

Fluxit provides a default dispatcher but a custom Dispatcher can be specified:
in `Fluxit.initialize`:

        Fluxit.initialize({
            dispatcher: // dispatcher implementation
        });

When Fluxit is initialized it will set the default dispatcher for both stores
and actions by calling `Store.setDispatcher` and `Action.setDispatcher`.

The Fluxit dispatcher can be accessed using `Fluxit.getDispatcher`

A dispatcher can be created using `Fluxit.Dispatcher`:

    var AppDispatcher = new Fluxit.Dispatcher();

#### Creating Stores

Use `Store.create`:

        var Store = Fluxit.Store;
        var AppStore = Store.create({
            displayName: 'AppStore',
            actions: {
                'ACTION_TYPE': 'handleAction'
            },
            handleAction: function(action) {
                // update store state based on action and notifiy listeners of change
                this.sendChange();
            }
        );
        // create an AppStore instance and specify options
        // options can be accessed in the store's action handlers with `this._options`
        var apps = new AppStore({});

The `displayName` property identifies the store and is used when registering
a store with the dispatcher property identifies the store and is used when
registering a store with the dispatcher.

The `actions` property defines what actions the store will handle when
dispatched. The handler can be a function or a string identifying the store's
method to call. Note that all handlers are called with the store as the `this`
argument.


Alternatively, you can specify your own `initialize` method for the store and
call `onAction` to register action callbacks:


        var Store = Fluxit.Store;
        var AppStore = Store.create({
            displayName: 'AppStore',
            initialize: {
                // ... perform store specific initialization
                this.onAction('ACTION_TYPE, 'handleAction')
                .onAction('SOME_OTHER_ACTION_TYPE', 'handleSomeOtherAction')
                // or use a map
                this.onAction({
                  'ACTION_TYPE': 'handleAction',
                  'SOME_OTHER_ACTION':  'handleSomeOtherAction'
                });
            },
            handleAction: function(action) {
                // update store state based on action and notifiy listeners of change
                this.sendChange();
            },
            handleSomeOtherAction: function(action) {
                // ...
            }
        );

#### Actions

Fluxit provides a base action implementation:

        var Action = Fluxit.Action;

        // use the default dispatcher configured through Fluxit.initialize
        var appAction = Action.create(function(data) {
            this.dispatchAction('ACTION_TYPE', data);
        });

        // create multiple actions
        var actions = Action.create({
            save: function(data)  {
                // ...
            },
            update: function(data) {
                // ...
            }
        });

The Action implementation also provides a `dispatchError` method to signal
errors as a result of calling an action:

        var appAction = Action.create(function(data) {
            // ... do something with data that may result in an error
            this.dispatchError('ACTION_TYPE', err);
        });

The action data will have the following properties:

 - `error` - `true` to indicate the action resulted in an error
 - `cause` - the cause of the error, e.g. an exception that was thrown

