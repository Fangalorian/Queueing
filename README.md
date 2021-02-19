# Queueing

Pretty basic framework for queueing on Nexus using in game aliases.

Queue.nxs is what you want to import into Achaea.
Queue.js is the same as (function) Queue in the Nexus Settings. It's there if you want to see the underlying code outside of the client.

Comes with 4 functions:

**queue.do()** - sets an IG alias and queues it to the eqbal queue (use with bal/eq consuming actions i.e your bashing attack or set of pvp attacks)  
**queue.doFree()** - sets an IG alias and prepends it to the eqbal queue (use with balanceless actions i.e. get gold or get body)  
**queue.dor()** - sets an IG alias and attempts to add it to the eqbal queue every .25 seconds (effectively making you repeat something on balance)  
**queue.dor_stop()** - stops attempts at adding the alias set by queue.dor() to the eqbal queue

  

The framework should respect the current 20 actions per IG alias limit.

  

**do()**, **doFree()**, and **dor()** all keep track what the most recently set alias was and if the alias is currently queued, so aliases are only updated when the contents are different and are only added to the eqbal queue if not already there.  

This means you won't be spamming a million 'setalias x' or 'queue add eqbal' commands when you're spamming enter. (Though those are gagged!)

  

Some usage examples:  

**do()** and **doFree()** take comma separated strings as parameters so they can count how many actions you're placing in the alias. They then build and set the alias.

queue.do('ent', 'group', 'wield eyesigil', 'throw eyesigil at ground');
queue.doFree('get sovereigns', 'put sovereigns in pack');

  

  

**dor()** takes an already constructed alias string  

queue.dor('construct concussionbomb');  
queue.dor('prepare #####');  
queue.dor('wield shield/wield sword/jab denizen');

  

If you want to have variable actions, you can also pass **do()** and **doFree()** arrays of strings like so:

let commands = ['ent', 'group', 'wield eyesigil', 'throw eyesigil at ground'];

queue.do.apply(queue, command);
