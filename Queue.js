/*******************************************************************************
********************************************************************************
***
*** Create and define queue namespace
***
***		Functions:
***			- do(...args)
***				- params: An array of at most alias_limit-1 elements where each
***						  element is a single command to be placed in an alias.
***
***						  ie. queue.do('ent', 'group', 'wield eyesigil',
***								'throw eyesigil at ground');
***
***				- behaviour: Invokes dor_stop(), ceasing repeating actions.
***							 Updates mangorize alias with contents of provided
***							 parameters and adds alias to eqbal queue.
***							 Only updates mangorize alias if new actions
***							 differ from already previously queued actions.
***
***							 NB: do() automatically prepends stand/ to your
***								 mangorize alias
***
***
***			- doFree(...args)
***				- params: An array of at most alias_limit elements where each
***						  element is a single command to be placed in an alias.
***						  These commands should not consume bal/eq.
***
***						  i.e. queue.doFree('get sovereigns',
***											'put sovereigns in pack');
***
***				- behaviour: Appends provided parameters to melomash alias, up
***							 to alias_limit actions and prepends alias to eqbal
***							 queue.
***
***			- dor(action)
***				- params: A single string comprised of one or more commands to
***						  set an alias to.
***
***						i.e. queue.dor('construct concussionbomb');
***							 queue.dor('prepare #####');
***							 queue.dor('wield shield/wield sword/jab denizen');
***
***				- behaviour: Sets repeater alias to value of provided parameter
***							 and attempts to add repeater to the eqbal queue
***							 every .25 seconds if repeater is not already
***							 added to the queue.
***
***			- dor_stop()
***				- params: N/A
***
***				- behaviour: Terminates the dor() function's attempts to
***							 repeatedly queue the repeater alias and clears the
***							 repeater alias.
***
********************************************************************************
*******************************************************************************/

queue = {

    // Upper limit on # of actions permitted in a IG alias
    alias_limit: 20,

	// Stores most recently used queueing alias values
	melomash: [],			// for free (bal/eq - less) actions
	mangorize: null,		// for actions requiring bal/eq
    repeater_alias: null,	// for repeating actions over several balances

	// Tracks if alias are currently queued
	melomash_queued: false,
	mangorize_queued: false,
    repeater_queued: false,

    // Holds id of interval used for dor function
	// Use in cancellation of repeating the action
	repeater_id: null,

	// Used for actions requiring bal/eq
	// Sets alias if actions differ from stored values
	// Adds alias to eqbal queue
	do(...args) {
		// Stop any ongoing repeating actions
		this.dor_stop();

		let action = args.join('/');

		// Print error and exit if # params > alias_limit.
		if (args.length > this.alias_limit-1) {
			print(`Error: Cannot queue stand/${action} , # actions > ${this.alias_limit}`, 'red');
			return;
		}

		// Set alias and alias tracker
		if (this.mangorize !== action) {
			send_command(`setalias mangorize stand/${action}`);
		}

		// Queue the alias for bal/eq actions
		if (!this.mangorize_queued) {
			send_command('queue add eqbal mangorize');
		}
	},

	// Used for actions that don't require bal/eq
	// Sets alias if actions differ from stored values
	// Prepends alias to eqbal queue
	doFree(...args) {
		// Print error and exit if # free actions in alias > alias_limit
		if (this.melomash.length > this.alias_limit || args.length + this.melomash.length > this.alias_limit) {
			sys_echo(`Error: Cannot free queue ${args.join('/')} , # queued free actions > ${this.alias_limit}`, 'red');
			return;
		}

		// Set/Update alias and alias tracker
		let prev_action = this.melomash.join('/');
		this.melomash = [...this.melomash, ...args];
		let new_action = this.melomash.join('/');

		// Update actual alias
		if (prev_action != new_action) {
			send_command(`setalias melomash ${new_action}`);
		}

		// Prepends non-empty free action alias
		if (!this.melomash_queued && this.melomash.length > 0) {
			send_command('queue prepend eqbal melomash');
		}

	},

	// Continuously repeat the given action parameter
	dor(action) {
		// Stop any previous repeating action if it existed
		this.dor_stop();

		// Set/Update repeater alias and tracker
		if (this.repeater_alias != action) {
			send_command(`setalias repeater ${action}`);
		}

		// Attempt to queue repeater alias every .25 seconds
        // Only attempts to queue if not already queued
		this.repeater_id = setInterval( () =>  {
			if (!this.repeater_queued) {
				send_command('queue add eqbal repeater');
			}
		}, 250);
	},

	// Stop any ongoing repeating actions
	dor_stop() {
		if (this.repeater_id != null) {
			clearInterval(this.repeater_id);	// Kills interval that repeatedly atempts to queue repeater alias
		}
		this.repeater_id = null;
		this.repeater_alias = null;

		// Clear the alias so nothing happens even if it gets queued again by timing mismatch
		send_command('alias clear repeater');
	},

};
