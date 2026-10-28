// Curated High-Yield Diagnostic Question Banks with Deep Misconception Tagging
// Provides deterministic, topic-aware pedagogical diagnostics when AI providers are offline.

export const FALLBACK_TOPICS = [
  {
    id: 'python-memory',
    title: 'Python Memory & Object Mutability',
    category: 'Computer Science',
    description: 'Diagnoses mental models of variable bindings, mutable default arguments, and shallow vs deep copies.',
    concepts: [
      { id: 'var-binding', name: 'Name Binding vs Memory Allocation', prereq: null },
      { id: 'list-mutability', name: 'In-Place List Mutation vs Reassignment', prereq: 'var-binding' },
      { id: 'default-args', name: 'Mutable Default Arguments Lifecycle', prereq: 'list-mutability' },
      { id: 'shallow-copy', name: 'Shallow vs Deep Copy References', prereq: 'var-binding' }
    ],
    questions: [
      // Foundational
      {
        id: 'py-found-1',
        conceptId: 'var-binding',
        conceptName: 'Name Binding vs Memory Allocation',
        prereqId: null,
        difficulty: 'foundational',
        question: 'What is the value of `y` after the following reassignment?',
        code: `x = 10\ny = x\nx = 20\nprint(y)`,
        options: [
          {
            id: 'A',
            text: '20',
            isCorrect: false,
            misconceptionId: 'primitive-reference-myth',
            misconceptionLabel: 'Variable Alias Dependency Misconception',
            misconceptionExplanation: 'You assumed `y` updates automatically when `x` changes. In Python, integers are immutable; `y = x` binds `y` to the object `10`. Reassigning `x = 20` binds `x` to a new object `20`.'
          },
          {
            id: 'B',
            text: '10',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `x` is rebound to `20`, but `y` still references the integer object `10`.'
          },
          {
            id: 'C',
            text: 'None',
            isCorrect: false,
            misconceptionId: 'reassignment-void-confusion',
            misconceptionLabel: 'Reassignment Return Value Confusion',
            misconceptionExplanation: 'Assignment statements in Python do not return None or clear existing variable bindings.'
          },
          {
            id: 'D',
            text: '[10, 20]',
            isCorrect: false,
            misconceptionId: 'assignment-concatenation-fallacy',
            misconceptionLabel: 'Sequential Assignment List Fallacy',
            misconceptionExplanation: 'Variables hold singular object bindings unless explicitly defined as lists or tuples.'
          }
        ],
        remediation: {
          conceptExplanation: 'Python variables are named pointers to objects in memory. For immutable primitives (integers, strings, floats), reassignment binds the variable name to a new object.',
          mentalModelFix: 'Variables are tags on boxes, not the boxes themselves. Moving tag `x` to a new box does not move tag `y`!',
          followUpQuestion: {
            id: 'py-found-1-followup',
            question: 'Given `a = "hello"` and `b = a`. What happens to `b` when we do `a = "world"`?',
            options: [
              { id: 'A', text: '`b` remains `"hello"`', isCorrect: true, explanation: 'Correct! Strings are immutable and reassignment does not affect `b`.' },
              { id: 'B', text: '`b` becomes `"world"`', isCorrect: false, explanation: 'Strings are immutable and `b` continues pointing to `"hello"`.' },
              { id: 'C', text: '`b` throws a NameError', isCorrect: false, explanation: '`b` retains its valid reference.' }
            ]
          }
        }
      },
      // Intermediate
      {
        id: 'py-q1',
        conceptId: 'var-binding',
        conceptName: 'Name Binding vs Memory Allocation',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'What is the output of the following code snippet?',
        code: `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)`,
        options: [
          {
            id: 'A',
            text: '[1, 2, 3]',
            isCorrect: false,
            misconceptionId: 'pass-by-value-mental-model',
            misconceptionLabel: 'Variable = Independent Box Misconception',
            misconceptionExplanation: 'You assumed that `b = a` copies the list contents into a new independent memory location. In Python, variables are named references (sticky notes) pointing to objects in memory; `b = a` points to the exact same list.'
          },
          {
            id: 'B',
            text: '[1, 2, 3, 4]',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In Python, variables are references to objects. Both `a` and `b` reference the same mutable list.'
          },
          {
            id: 'C',
            text: 'AttributeError: list has no attribute append',
            isCorrect: false,
            misconceptionId: 'syntax-uncertainty',
            misconceptionLabel: 'Standard Library API Confusion',
            misconceptionExplanation: 'You confused the list API. `.append()` is a valid built-in method for mutating lists.'
          },
          {
            id: 'D',
            text: 'None',
            isCorrect: false,
            misconceptionId: 'return-value-confusion',
            misconceptionLabel: 'In-Place Mutation Return Value Confusion',
            misconceptionExplanation: 'While `b.append(4)` returns `None`, `print(a)` prints the mutated list `a`, not the result of the append call.'
          }
        ],
        remediation: {
          conceptExplanation: 'Python does not store values directly inside variable boxes. Instead, all variables are pointers (references) to objects allocated in memory.',
          mentalModelFix: 'Think of variables as adhesive sticky note labels placed on the same physical box. Sticking a second label `b` onto box `a` does not clone the box!',
          followUpQuestion: {
            id: 'py-q1-followup',
            question: 'Given `x = [10]`, `y = x`, followed by `x = [20]`. What is the value of `y`?',
            options: [
              { id: 'A', text: '[10]', isCorrect: true, explanation: 'Exactly right! `x = [20]` rebinds label `x` to a brand-new list object, while `y` still points to the original `[10]` object.' },
              { id: 'B', text: '[20]', isCorrect: false, explanation: 'Incorrect. Reassigning `x = [20]` breaks the pointer connection; it does not mutate the existing list object.' },
              { id: 'C', text: '[10, 20]', isCorrect: false, explanation: 'Incorrect. Reassignment `=` is not an append or concatenation operation.' }
            ]
          }
        }
      },
      {
        id: 'py-q2',
        conceptId: 'default-args',
        conceptName: 'Mutable Default Arguments Lifecycle',
        prereqId: 'list-mutability',
        difficulty: 'intermediate',
        question: 'What is the output when `append_item` is invoked three consecutive times?',
        code: `def append_item(val, target=[]):\n    target.append(val)\n    return target\n\nprint(append_item(1))\nprint(append_item(2))\nprint(append_item(3))`,
        options: [
          {
            id: 'A',
            text: '[1]\n[2]\n[3]',
            isCorrect: false,
            misconceptionId: 'call-time-evaluation-mental-model',
            misconceptionLabel: 'Call-Time Evaluation Fallacy',
            misconceptionExplanation: 'You assumed `target=[]` creates a brand-new empty list on every function call. In Python, default arguments are evaluated only ONCE at function definition time (def statement), not at call time.'
          },
          {
            id: 'B',
            text: '[1]\n[1, 2]\n[1, 2, 3]',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The default list object persists across subsequent calls because the default argument is evaluated once when the function is defined.'
          },
          {
            id: 'C',
            text: '[1, 2, 3]\n[1, 2, 3]\n[1, 2, 3]',
            isCorrect: false,
            misconceptionId: 'static-snapshot-confusion',
            misconceptionLabel: 'Static Value Snapshot Confusion',
            misconceptionExplanation: 'The calls execute sequentially, printing the list state incrementally after each append.'
          },
          {
            id: 'D',
            text: 'TypeError: target cannot be modified in local scope',
            isCorrect: false,
            misconceptionId: 'local-scope-immutability-myth',
            misconceptionLabel: 'Local Scope Immutability Myth',
            misconceptionExplanation: 'Default arguments are normal Python objects in memory and can be mutated unless protected.'
          }
        ],
        remediation: {
          conceptExplanation: 'Python evaluates default parameter expressions once when the `def` statement executes. That single object is reused across all invocations that omit the argument.',
          mentalModelFix: 'Never use mutable objects (lists, dicts, sets) as default arguments. Use `target=None` and initialize inside: `if target is None: target = []`.',
          followUpQuestion: {
            id: 'py-q2-followup',
            question: 'What is the idiomatic Python pattern to avoid mutable default argument traps?',
            options: [
              { id: 'A', text: '`def fn(target=None): if target is None: target = []`', isCorrect: true, explanation: 'Correct! None is an immutable sentinel evaluated once safely.' },
              { id: 'B', text: '`def fn(target=list()): target.freeze()`', isCorrect: false, explanation: 'Python lists do not have a .freeze() method.' },
              { id: 'C', text: '`def fn(global target=[]): pass`', isCorrect: false, explanation: 'The global keyword cannot be used in parameter declarations.' }
            ]
          }
        }
      },
      // Advanced
      {
        id: 'py-q3',
        conceptId: 'shallow-copy',
        conceptName: 'Shallow vs Deep Copy References',
        prereqId: 'var-binding',
        difficulty: 'advanced',
        question: 'What does `print(b)` output after this nested list modification?',
        code: `import copy\na = [[1, 2], [3, 4]]\nb = copy.copy(a)\na[0][0] = 99\na.append([5, 6])\nprint(b)`,
        options: [
          {
            id: 'A',
            text: '[[1, 2], [3, 4]]',
            isCorrect: false,
            misconceptionId: 'copy-always-deep-mental-model',
            misconceptionLabel: 'Shallow Copy Clones All Nested Levels Fallacy',
            misconceptionExplanation: 'You assumed `copy.copy(a)` clones nested inner lists. `copy.copy` is SHALLOW: it creates a new outer list, but fills it with the exact same references to the inner lists!'
          },
          {
            id: 'B',
            text: '[[99, 2], [3, 4]]',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The outer list `b` was cloned (so `a.append` did not affect `b`), but the nested lists inside `b` are references to the same lists in `a`.'
          },
          {
            id: 'C',
            text: '[[99, 2], [3, 4], [5, 6]]',
            isCorrect: false,
            misconceptionId: 'shallow-copy-reassignment-fallacy',
            misconceptionLabel: 'Outer Container Identity Conflation',
            misconceptionExplanation: 'The outer list is an independent copy, so `a.append([5, 6])` does not modify `b`.'
          },
          {
            id: 'D',
            text: '[[1, 2], [3, 4], [5, 6]]',
            isCorrect: false,
            misconceptionId: 'selective-mutation-mirage',
            misconceptionLabel: 'Selective Mutation Mirage',
            misconceptionExplanation: 'The mutation `a[0][0] = 99` mutates the inner shared list object.'
          }
        ],
        remediation: {
          conceptExplanation: 'Shallow copy constructs a new compound object and inserts references into it. Deep copy recursively constructs new copies of all child objects.',
          mentalModelFix: 'Shallow copy clones the egg carton, not the eggs inside it. If you want separate eggs, use `copy.deepcopy(a)`.',
          followUpQuestion: {
            id: 'py-q3-followup',
            question: 'Which method creates an entirely independent copy of arbitrary nested objects in Python?',
            options: [
              { id: 'A', text: '`copy.deepcopy(obj)`', isCorrect: true, explanation: 'Correct! copy.deepcopy traverses and duplicates all nested objects.' },
              { id: 'B', text: '`obj[:]`', isCorrect: false, explanation: 'Slice syntax [:] only performs a shallow copy.' },
              { id: 'C', text: '`list.clone(obj)`', isCorrect: false, explanation: 'Python lists have `.copy()`, not `.clone()`.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'javascript-closures',
    title: 'JavaScript Closures & Lexical Scope',
    category: 'Web & Language Internals',
    description: 'Diagnoses mental models of lexical scoping, execution contexts, variable persistence after outer return, and the classic loop closure trap.',
    concepts: [
      { id: 'lexical-scope', name: 'Lexical Scoping & Scope Chain Resolution', prereq: null },
      { id: 'closure-retention', name: 'Closure Environment & Variable Retention after Return', prereq: 'lexical-scope' },
      { id: 'loop-closure-trap', name: 'Asynchronous Callbacks & The "var" vs "let" Loop Trap', prereq: 'closure-retention' },
      { id: 'data-privacy', name: 'Data Encapsulation & Private State Factories', prereq: 'closure-retention' }
    ],
    questions: [
      // Foundational
      {
        id: 'js-closure-found-1',
        conceptId: 'lexical-scope',
        conceptName: 'Lexical Scoping & Scope Chain Resolution',
        prereqId: null,
        difficulty: 'foundational',
        question: 'What does the inner function output when invoked after the outer function finishes executing?',
        code: `function makeGreeter(greeting) {\n  return function(name) {\n    return \`\${greeting}, \${name}!\`;\n  };\n}\nconst sayHello = makeGreeter("Hello");\nconsole.log(sayHello("Alice"));`,
        options: [
          {
            id: 'A',
            text: 'undefined, Alice!',
            isCorrect: false,
            misconceptionId: 'scope-evaporation-myth',
            misconceptionLabel: 'Outer Scope Evaporation Myth',
            misconceptionExplanation: 'You assumed that parameters disappear from memory when `makeGreeter` finishes. In JavaScript, inner functions close over and preserve their surrounding lexical scope.'
          },
          {
            id: 'B',
            text: 'Hello, Alice!',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The returned function retains access to `greeting` via lexical closure.'
          },
          {
            id: 'C',
            text: 'ReferenceError: greeting is not defined',
            isCorrect: false,
            misconceptionId: 'return-boundary-barrier',
            misconceptionLabel: 'Return Boundary Scope Barrier Misconception',
            misconceptionExplanation: 'Functions retain references to variables declared in enclosing scopes regardless of when or where they are executed.'
          },
          {
            id: 'D',
            text: 'null, Alice!',
            isCorrect: false,
            misconceptionId: 'null-fallback-assumption',
            misconceptionLabel: 'Parameter Null Fallback Assumption',
            misconceptionExplanation: 'JavaScript preserves the actual bound value `"Hello"`, not null.'
          }
        ],
        remediation: {
          conceptExplanation: 'In JavaScript, functions form closures around their lexical environment at the moment of declaration. The inner function carries a reference to `greeting` wherever it goes.',
          mentalModelFix: 'Think of a closure as a backpack that the inner function wears. It packs all variables from its outer scope and carries them forever.',
          followUpQuestion: {
            id: 'js-closure-found-1-followup',
            question: 'If we create `const sayHi = makeGreeter("Hi")`, does it share or modify `sayHello`\'s greeting?',
            options: [
              { id: 'A', text: 'No, every call to `makeGreeter` creates a new independent lexical scope', isCorrect: true, explanation: 'Spot on! Each invocation allocates a distinct execution context.' },
              { id: 'B', text: 'Yes, it overwrites the greeting for all greeter functions', isCorrect: false, explanation: 'Outer variables are instantiated per call, not globally.' },
              { id: 'C', text: 'It throws a DuplicateDeclaration error', isCorrect: false, explanation: 'Different closures can have variables with the same name.' }
            ]
          }
        }
      },
      {
        id: 'js-closure-found-2',
        conceptId: 'closure-retention',
        conceptName: 'Closure Environment & Variable Retention after Return',
        prereqId: 'lexical-scope',
        difficulty: 'foundational',
        question: 'What is printed to the console when `counter()` is called twice consecutively?',
        code: `function createCounter() {\n  let count = 0;\n  return function() {\n    count += 1;\n    return count;\n  };\n}\nconst counter = createCounter();\nconsole.log(counter());\nconsole.log(counter());`,
        options: [
          {
            id: 'A',
            text: '1 then 1',
            isCorrect: false,
            misconceptionId: 'variable-reinit-myth',
            misconceptionLabel: 'Closure Variable Re-initialization Fallacy',
            misconceptionExplanation: 'You assumed `let count = 0` executes every time `counter()` is invoked. `createCounter()` only executed once when defining `counter`. `count` persists in memory.'
          },
          {
            id: 'B',
            text: '1 then 2',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `count` remains alive in the closure and increments with each call.'
          },
          {
            id: 'C',
            text: '0 then 1',
            isCorrect: false,
            misconceptionId: 'pre-increment-confusion',
            misconceptionLabel: 'Increment Timing Confusion',
            misconceptionExplanation: '`count += 1` executes before returning, producing 1 on the first call, then 2.'
          },
          {
            id: 'D',
            text: 'NaN then NaN',
            isCorrect: false,
            misconceptionId: 'closure-type-decay',
            misconceptionLabel: 'Closure Type Decay Myth',
            misconceptionExplanation: 'Numbers retain their type inside closures.'
          }
        ],
        remediation: {
          conceptExplanation: 'Variables declared in an outer function remain in memory as long as any inner function referencing them is reachable. They are not destroyed when the outer function returns.',
          mentalModelFix: 'Variables live in heap-allocated lexical environment records. They only get garbage collected when no closures reference them.',
          followUpQuestion: {
            id: 'js-closure-found-2-followup',
            question: 'If we define `const counterB = createCounter()`, what is `counterB()`\'s first return value?',
            options: [
              { id: 'A', text: '1, because counterB has its own independent `count` variable', isCorrect: true, explanation: 'Correct! A new lexical environment is created for each call.' },
              { id: 'B', text: '3, because it shares count with counter', isCorrect: false, explanation: 'Lexical environments are separate per function invocation.' },
              { id: 'C', text: '0, because it has not been registered', isCorrect: false, explanation: 'The function runs count += 1 and returns 1.' }
            ]
          }
        }
      },
      {
        id: 'js-closure-found-3',
        conceptId: 'data-privacy',
        conceptName: 'Data Encapsulation & Private State Factories',
        prereqId: 'closure-retention',
        difficulty: 'foundational',
        question: 'How does the returned object in the following snippet provide private state?',
        code: `function createVault(secret) {\n  return {\n    getSecret() { return secret; }\n  };\n}\nconst vault = createVault("super-token");\nconsole.log(vault.secret);\nconsole.log(vault.getSecret());`,
        options: [
          {
            id: 'A',
            text: 'undefined then "super-token"',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `secret` is not an object property on `vault`, so `vault.secret` is undefined. It is only accessible via the `getSecret()` closure!'
          },
          {
            id: 'B',
            text: '"super-token" then "super-token"',
            isCorrect: false,
            misconceptionId: 'property-vs-lexical-conflation',
            misconceptionLabel: 'Object Property vs Lexical Variable Conflation',
            misconceptionExplanation: 'You assumed function parameters become direct properties on returned objects. In JavaScript, parameters stay in the lexical environment.'
          },
          {
            id: 'C',
            text: 'TypeError: vault.getSecret is not a function',
            isCorrect: false,
            misconceptionId: 'method-export-myth',
            misconceptionLabel: 'Object Method Export Myth',
            misconceptionExplanation: '`getSecret` is a valid method on the returned object.'
          },
          {
            id: 'D',
            text: 'undefined then undefined',
            isCorrect: false,
            misconceptionId: 'closure-forgetting-fallacy',
            misconceptionLabel: 'Closure Variable Erasure Fallacy',
            misconceptionExplanation: 'The closure safely retains access to `secret`.'
          }
        ],
        remediation: {
          conceptExplanation: 'Closures are the primary mechanism for information hiding and data privacy in JavaScript. Variables not explicitly assigned to the returned object remain private to the closure.',
          mentalModelFix: 'The vault object holds a keyhole (`getSecret`), not the treasure itself. The treasure stays safe in the outer lexical room!',
          followUpQuestion: {
            id: 'js-closure-found-3-followup',
            question: 'Can external code modify `secret` directly without a setter function?',
            options: [
              { id: 'A', text: 'No, there is no reference to `secret` outside the closure', isCorrect: true, explanation: 'Correct! Private state cannot be touched without exposing a mutator.' },
              { id: 'B', text: 'Yes, via `delete vault.secret`', isCorrect: false, explanation: '`secret` is not a property of vault.' },
              { id: 'C', text: 'Yes, by calling `createVault.prototype`', isCorrect: false, explanation: 'Prototypes do not provide access to lexical variables.' }
            ]
          }
        }
      },
      // Intermediate
      {
        id: 'js-closure-inter-1',
        conceptId: 'loop-closure-trap',
        conceptName: 'Asynchronous Callbacks & The "var" vs "let" Loop Trap',
        prereqId: 'closure-retention',
        difficulty: 'intermediate',
        question: 'What numbers are printed to the console when the following code runs?',
        code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 50);\n}`,
        options: [
          {
            id: 'A',
            text: '0, 1, 2',
            isCorrect: false,
            misconceptionId: 'closure-captures-value-myth',
            misconceptionLabel: 'Closure Captures Value at Call Time Fallacy',
            misconceptionExplanation: 'You assumed each `setTimeout` callback captures a snapshot copy of `i` when scheduled. In JavaScript, closures capture REFERENCES to variables, not values. Because `var` is function-scoped, all 3 callbacks share the same `i`, which equals 3 when the timers fire!'
          },
          {
            id: 'B',
            text: '3, 3, 3',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `var` is function-scoped. The loop terminates when `i === 3`, and all 3 asynchronous callbacks execute afterwards, reading `i` as 3.'
          },
          {
            id: 'C',
            text: 'undefined, undefined, undefined',
            isCorrect: false,
            misconceptionId: 'loop-scope-termination-myth',
            misconceptionLabel: 'Loop Scope Termination Fallacy',
            misconceptionExplanation: '`var` is hoisted to the enclosing function or global scope, so `i` remains in scope after the loop finishes.'
          },
          {
            id: 'D',
            text: '0, 0, 0',
            isCorrect: false,
            misconceptionId: 'timer-reset-confusion',
            misconceptionLabel: 'Timer Scope Reset Confusion',
            misconceptionExplanation: 'The variable `i` is not reset; it increments to 3.'
          }
        ],
        remediation: {
          conceptExplanation: 'Closures capture variable references, not copies of values. With `var i`, there is only ONE shared variable in the parent scope.',
          mentalModelFix: '`var` provides a single shared whiteboard for all iterations. `let` gives each iteration its own brand-new index card with that iteration\'s value!',
          followUpQuestion: {
            id: 'js-closure-inter-1-followup',
            question: 'How do you fix this loop so it prints `0, 1, 2` without changing setTimeout?',
            options: [
              { id: 'A', text: 'Replace `var i = 0` with `let i = 0`', isCorrect: true, explanation: 'Correct! let is block-scoped, binding a fresh `i` for each iteration.' },
              { id: 'B', text: 'Change `i < 3` to `i <= 3`', isCorrect: false, explanation: 'This would just print 4 four times.' },
              { id: 'C', text: 'Set delay from 50 to 0', isCorrect: false, explanation: '0ms timers are still macrotasks and execute after the synchronous loop.' }
            ]
          }
        }
      },
      {
        id: 'js-closure-inter-2',
        conceptId: 'closure-retention',
        conceptName: 'Block-Scoped Variable Bindings in Loops ("let" vs "var")',
        prereqId: 'lexical-scope',
        difficulty: 'intermediate',
        question: 'Why does changing `var i = 0` to `let i = 0` cause the loop to output `0, 1, 2`?',
        code: `for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 10);\n}`,
        options: [
          {
            id: 'A',
            text: 'Because `let` converts the `setTimeout` callback into a synchronous function.',
            isCorrect: false,
            misconceptionId: 'let-synchronous-mirage',
            misconceptionLabel: 'Let Forces Synchronous Execution Myth',
            misconceptionExplanation: '`setTimeout` remains completely asynchronous regardless of how variables are declared.'
          },
          {
            id: 'B',
            text: 'Because `let` creates a distinct, brand-new lexical scope binding for `i` in each loop iteration.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In JavaScript ES6, `let` in for-loops re-binds the variable per iteration, so each callback closes over its own separate `i`.'
          },
          {
            id: 'C',
            text: 'Because `let` prevents the event loop from buffering macrotasks.',
            isCorrect: false,
            misconceptionId: 'event-loop-tampering-myth',
            misconceptionLabel: 'Variable Declaration Affects Event Loop Myth',
            misconceptionExplanation: 'The event loop operates independently of variable scoping keywords.'
          },
          {
            id: 'D',
            text: 'Because `let` automatically freezes all objects passed to timers.',
            isCorrect: false,
            misconceptionId: 'let-freezes-objects-myth',
            misconceptionLabel: 'Let Immutability Myth',
            misconceptionExplanation: '`let` allows reassignment; it is `const` that forbids reassignment.'
          }
        ],
        remediation: {
          conceptExplanation: 'The ECMAScript specification explicitly defines that for `for (let ...)` loops, a new lexical environment record is created for every single iteration, copying the current value.',
          mentalModelFix: '`let` in a for-loop takes a snapshot index card for that iteration. Closures formed in that iteration keep that specific card forever.',
          followUpQuestion: {
            id: 'js-closure-inter-2-followup',
            question: 'What is the pre-ES6 pattern used to achieve this isolation with `var`?',
            options: [
              { id: 'A', text: 'Wrapping the timer in an IIFE (Immediately Invoked Function Expression) passing `i`', isCorrect: true, explanation: 'Correct! IIFEs created a new function scope before block-scoped `let` existed.' },
              { id: 'B', text: 'Using `eval("var i = ...")`', isCorrect: false, explanation: 'Eval does not create block scope and introduces security flaws.' },
              { id: 'C', text: 'Setting `window.i = i`', isCorrect: false, explanation: 'Global variables exacerbate shared state bugs.' }
            ]
          }
        }
      },
      {
        id: 'js-closure-inter-3',
        conceptId: 'lexical-scope',
        conceptName: 'Scope Chain Lookup & Identifier Shadowing Invariants',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'What is printed to the console when `outer()()` executes?',
        code: `const x = "global";\nfunction outer() {\n  const x = "outer";\n  return function inner() {\n    const x = "inner";\n    console.log(x);\n  };\n}\nouter()();`,
        options: [
          {
            id: 'A',
            text: 'inner',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Lexical scope lookup resolves outward starting from the innermost scope. The innermost `const x = "inner"` shadows outer declarations.'
          },
          {
            id: 'B',
            text: 'outer',
            isCorrect: false,
            misconceptionId: 'parent-precedence-myth',
            misconceptionLabel: 'Parent Scope Precedence Myth',
            misconceptionExplanation: 'Scope resolution starts locally and searches outwards, never the other way around.'
          },
          {
            id: 'C',
            text: 'global',
            isCorrect: false,
            misconceptionId: 'global-precedence-fallacy',
            misconceptionLabel: 'Global Variable Dominance Fallacy',
            misconceptionExplanation: 'Global variables are at the very bottom of the scope chain and are shadowed by local bindings.'
          },
          {
            id: 'D',
            text: 'SyntaxError: Identifier "x" has already been declared',
            isCorrect: false,
            misconceptionId: 'shadowing-as-syntax-error',
            misconceptionLabel: 'Shadowing as Syntax Error Misconception',
            misconceptionExplanation: 'Declaring a variable with the same name in a different nested scope is valid shadowing, not a duplicate declaration error.'
          }
        ],
        remediation: {
          conceptExplanation: 'When resolving an identifier, the JavaScript engine traverses the scope chain from the currently executing execution context outward until it finds the first matching binding.',
          mentalModelFix: 'Scope lookup is like looking out from a tent. You look inside your tent first. If you find what you need, you stop looking outside!',
          followUpQuestion: {
            id: 'js-closure-inter-3-followup',
            question: 'What happens if `inner()` does NOT declare `x`?',
            options: [
              { id: 'A', text: 'It walks up the scope chain and logs "outer"', isCorrect: true, explanation: 'Correct! Finding no local x, it resolves to outer\'s x.' },
              { id: 'B', text: 'It immediately throws an error', isCorrect: false, explanation: 'It searches outer scopes before throwing.' },
              { id: 'C', text: 'It logs undefined', isCorrect: false, explanation: 'It reads outer\'s value.' }
            ]
          }
        }
      },
      // Advanced
      {
        id: 'js-closure-adv-1',
        conceptId: 'data-privacy',
        conceptName: 'Data Encapsulation & Lexical vs Dynamic Context',
        prereqId: 'closure-retention',
        difficulty: 'advanced',
        question: 'What is the output when the destructured method `getValue()` is called?',
        code: `function createStore(initial) {\n  let val = initial;\n  return {\n    increment() { val += 1; },\n    getValue() { return val; }\n  };\n}\nconst store = createStore(42);\nconst { increment, getValue } = store;\nincrement();\nconsole.log(getValue());`,
        options: [
          {
            id: 'A',
            text: 'TypeError: Cannot read properties of undefined',
            isCorrect: false,
            misconceptionId: 'this-vs-closure-conflation',
            misconceptionLabel: 'Dynamic `this` vs Lexical Closure Conflation',
            misconceptionExplanation: 'You assumed destructuring broke access to `val` because destructuring loses `this`. However, `val` is accessed via LEXICAL CLOSURE, not via `this.val`! The closure remains 100% intact.'
          },
          {
            id: 'B',
            text: '43',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `val` is enclosed lexically in the closure scope, so detaching the methods from `store` does not break variable access.'
          },
          {
            id: 'C',
            text: '42',
            isCorrect: false,
            misconceptionId: 'detached-method-mutation-void',
            misconceptionLabel: 'Detached Method Mutation Void Fallacy',
            misconceptionExplanation: '`increment()` successfully mutated the closed-over `val` in the parent scope from 42 to 43.'
          },
          {
            id: 'D',
            text: 'undefined',
            isCorrect: false,
            misconceptionId: 'closure-scope-leakage-myth',
            misconceptionLabel: 'Closure Scope Destruction Myth',
            misconceptionExplanation: 'Lexical scopes persist in memory as long as reachable function references exist.'
          }
        ],
        remediation: {
          conceptExplanation: 'Closures resolve identifiers lexically (based on where functions are authored in source code). They are completely immune to dynamic `this` rebinding or method destructuring.',
          mentalModelFix: '`this` is dynamic (who invoked me?). Closures are lexical (where was I declared?). Destructuring breaks `this`, but never breaks closures.',
          followUpQuestion: {
            id: 'js-closure-adv-1-followup',
            question: 'Can code outside `createStore` directly mutate `val` without calling `increment()`?',
            options: [
              { id: 'A', text: 'No, `val` is truly private and inaccessible to outside callers', isCorrect: true, explanation: 'Correct! Closures are the foundational mechanism for true private state in JS.' },
              { id: 'B', text: 'Yes, via `store.val = 100`', isCorrect: false, explanation: '`val` is not a property on `store`; it is a local lexical variable.' },
              { id: 'C', text: 'Yes, via `Object.keys(store)`', isCorrect: false, explanation: 'Object.keys only lists enumerable object properties, not lexical variables.' }
            ]
          }
        }
      },
      {
        id: 'js-closure-adv-2',
        conceptId: 'data-privacy',
        conceptName: 'Sibling Closures Sharing the Same Lexical Scope Record',
        prereqId: 'closure-retention',
        difficulty: 'advanced',
        question: 'What is returned by `addFive()` after `double()` executes?',
        code: `function setup() {\n  let shared = 10;\n  return [\n    () => { shared *= 2; return shared; },\n    () => { shared += 5; return shared; }\n  ];\n}\nconst [double, addFive] = setup();\ndouble();\nconsole.log(addFive());`,
        options: [
          {
            id: 'A',
            text: '15',
            isCorrect: false,
            misconceptionId: 'sibling-closure-isolation-myth',
            misconceptionLabel: 'Sibling Closure Scope Isolation Fallacy',
            misconceptionExplanation: 'You assumed each returned function received its own separate copy of `shared`. Because both functions were created inside the SAME call to `setup()`, they share the exact SAME lexical scope environment. `double()` mutated `shared` from 10 to 20; then `addFive()` increments it to 25!'
          },
          {
            id: 'B',
            text: '25',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Sibling closures from the same execution context share mutable state. 10 * 2 = 20, then 20 + 5 = 25.'
          },
          {
            id: 'C',
            text: '20',
            isCorrect: false,
            misconceptionId: 'second-function-suppression',
            misconceptionLabel: 'Second Function Execution Suppression Myth',
            misconceptionExplanation: '`addFive()` executes its full body, adding 5 to 20.'
          },
          {
            id: 'D',
            text: 'NaN',
            isCorrect: false,
            misconceptionId: 'cross-closure-arithmetic-error',
            misconceptionLabel: 'Cross-Closure Arithmetic Corruption Myth',
            misconceptionExplanation: 'Standard arithmetic operators work identically across shared lexical bindings.'
          }
        ],
        remediation: {
          conceptExplanation: 'When multiple functions are declared within the same parent execution context, they all hold references to the exact same environment record in memory.',
          mentalModelFix: 'All functions created inside a single parent call drink from the exact same water fountain. If one adds dye to the fountain, all others taste it!',
          followUpQuestion: {
            id: 'js-closure-adv-2-followup',
            question: 'If you want `double` and `addFive` to NOT affect each other, what must you do?',
            options: [
              { id: 'A', text: 'Call `setup()` separately for each function so they get different lexical environments', isCorrect: true, explanation: 'Correct! Each call to setup() allocates a separate lexical environment record.' },
              { id: 'B', text: 'Declare `shared` as a `var` instead of `let`', isCorrect: false, explanation: '`var` would still be shared within that same function call.' },
              { id: 'C', text: 'Freeze the return array', isCorrect: false, explanation: 'Freezing the array prevents array mutation, not closure mutation.' }
            ]
          }
        }
      },
      {
        id: 'js-closure-adv-3',
        conceptId: 'loop-closure-trap',
        conceptName: 'Engine Optimization & Lexical Scope Pruning',
        prereqId: 'closure-retention',
        difficulty: 'advanced',
        question: 'How do modern JavaScript engines (such as V8) optimize closure memory consumption when outer variables are not referenced?',
        code: `function loadData() {\n  const massiveBuffer = new Array(1000000).fill("heavy");\n  const recordId = 42;\n  return function getRecordId() {\n    return recordId; // Notice massiveBuffer is NEVER used here!\n  };\n}`,
        options: [
          {
            id: 'A',
            text: 'Engines perform static analysis and only capture variables syntactically referenced by the closure, allowing unreferenced variables like `massiveBuffer` to be garbage collected.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Modern JS engines optimize context allocation, creating closure contexts containing only the variables actually accessed by inner functions.'
          },
          {
            id: 'B',
            text: 'Engines always retain the entire outer execution context unconditionally, permanently leaking `massiveBuffer`.',
            isCorrect: false,
            misconceptionId: 'monolithic-context-myth',
            misconceptionLabel: 'Monolithic Context Retention Myth',
            misconceptionExplanation: 'Modern engines perform escape and static reference analysis to avoid retaining unused variables.'
          },
          {
            id: 'C',
            text: 'Engines convert all arrays inside functions into hard drive disk swap files.',
            isCorrect: false,
            misconceptionId: 'disk-swap-mirage',
            misconceptionLabel: 'Automatic Disk Swapping Myth',
            misconceptionExplanation: 'V8 manages heap allocations in RAM, not arbitrary disk swap.'
          },
          {
            id: 'D',
            text: 'The engine strips `recordId` and converts the return value into a global constant.',
            isCorrect: false,
            misconceptionId: 'closure-destruction-fallacy',
            misconceptionLabel: 'Closure Destruction Fallacy',
            misconceptionExplanation: 'The inner function remains a closure retaining `recordId`.'
          }
        ],
        remediation: {
          conceptExplanation: 'V8 and modern engines construct specialized Scope Context objects containing only the variables referenced by active inner functions (unless `eval()` or `debugger` prevents optimization).',
          mentalModelFix: 'If an inner function doesn\'t ask for a variable in its body, modern engines don\'t pack it into the closure backpack (unless `eval` forces them to).',
          followUpQuestion: {
            id: 'js-closure-adv-3-followup',
            question: 'What JavaScript keyword disables this V8 context allocation optimization and forces retaining all variables?',
            options: [
              { id: 'A', text: '`eval()`', isCorrect: true, explanation: 'Correct! Direct eval can access any variable dynamically, so the engine must retain the entire lexical environment.' },
              { id: 'B', text: '`const`', isCorrect: false, explanation: 'Const is fully optimizable.' },
              { id: 'C', text: '`return`', isCorrect: false, explanation: 'Return is standard syntax.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'react-useeffect',
    title: 'React useEffect Lifecycle & Hooks',
    category: 'Web Development',
    description: 'Diagnoses mental models of React dependency arrays, effect cleanup timing, and stale closure traps.',
    concepts: [
      { id: 'effect-deps', name: 'Dependency Array Evaluation & Re-render Triggers', prereq: null },
      { id: 'effect-cleanup', name: 'Cleanup Function Lifecycle & Execution Timing', prereq: 'effect-deps' },
      { id: 'stale-closures', name: 'Stale Closures inside Asynchronous Handlers', prereq: 'effect-deps' },
      { id: 'infinite-loop', name: 'State Mutation within Effect Body', prereq: 'effect-deps' }
    ],
    questions: [
      // Foundational
      {
        id: 'react-found-1',
        conceptId: 'effect-deps',
        conceptName: 'Dependency Array Evaluation & Re-render Triggers',
        prereqId: null,
        difficulty: 'foundational',
        question: 'What is the execution difference between omitting the dependency array vs providing an empty array `[]`?',
        code: `// Effect A:\nuseEffect(() => { console.log("A"); });\n\n// Effect B:\nuseEffect(() => { console.log("B"); }, []);`,
        options: [
          {
            id: 'A',
            text: 'Effect A runs on every render; Effect B runs only once after the initial mount.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Omitting the dependency array causes the effect to run after every single render. An empty array `[]` specifies zero dependencies, running only on mount.'
          },
          {
            id: 'B',
            text: 'Effect A and Effect B behave completely identically.',
            isCorrect: false,
            misconceptionId: 'omitted-vs-empty-deps-conflation',
            misconceptionLabel: 'Omitted vs Empty Dependency Array Conflation',
            misconceptionExplanation: 'You assumed omitting `[]` defaults to an empty array. Omitting the array means "run after every render".'
          },
          {
            id: 'C',
            text: 'Effect A never runs; Effect B runs on every state change.',
            isCorrect: false,
            misconceptionId: 'inverted-deps-logic',
            misconceptionLabel: 'Inverted Dependency Logic',
            misconceptionExplanation: 'This is the exact inverse of React lifecycle rules.'
          },
          {
            id: 'D',
            text: 'Effect A throws a compilation syntax error in React 18.',
            isCorrect: false,
            misconceptionId: 'syntax-rules-uncertainty',
            misconceptionLabel: 'Valid API Syntax Uncertainty',
            misconceptionExplanation: 'Omitting the dependency array is valid React syntax, though often discouraged.'
          }
        ],
        remediation: {
          conceptExplanation: 'React compares dependency array values between renders using `Object.is`. With no array, React bypasses comparison and always runs. With `[]`, dependencies never change, so it never re-runs.',
          mentalModelFix: 'No array = "I depend on everything (run every render)". Empty array `[]` = "I depend on nothing (run once on mount)".',
          followUpQuestion: {
            id: 'react-found-1-followup',
            question: 'What happens if you update state inside an effect that has no dependency array?',
            options: [
              { id: 'A', text: 'An infinite re-render loop that crashes the browser', isCorrect: true, explanation: 'Correct! State update triggers re-render, which triggers the effect, which updates state indefinitely.' },
              { id: 'B', text: 'React skips subsequent re-renders automatically', isCorrect: false, explanation: 'React cannot detect infinite loop intent automatically.' },
              { id: 'C', text: 'The component immediately unmounts', isCorrect: false, explanation: 'It re-renders continuously until execution limits are reached.' }
            ]
          }
        }
      },
      // Intermediate
      {
        id: 'react-q1',
        conceptId: 'effect-deps',
        conceptName: 'Dependency Array Evaluation & Re-render Triggers',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'In React, what happens when `useEffect` is passed an empty dependency array `[]`?',
        code: `useEffect(() => {\n  console.log("Effect executed");\n}, []);`,
        options: [
          {
            id: 'A',
            text: 'It executes on every single component render and re-render.',
            isCorrect: false,
            misconceptionId: 'missing-vs-empty-deps',
            misconceptionLabel: 'Missing vs Empty Dependencies Conflation',
            misconceptionExplanation: 'You confused an empty dependency array `[]` with omitting the array entirely. Omitting the array runs on every render; `[]` tells React the effect has zero dependencies and only runs once after initial mount.'
          },
          {
            id: 'B',
            text: 'It runs once after the initial component mount, and never runs on subsequent re-renders.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! An empty dependency array `[]` tells React that this effect does not depend on any state or props, so it only runs once after the initial mount.'
          },
          {
            id: 'C',
            text: 'It causes an infinite re-render loop.',
            isCorrect: false,
            misconceptionId: 'infinite-loop-confusion',
            misconceptionLabel: 'Infinite Loop Misattribution',
            misconceptionExplanation: 'An infinite loop occurs when an effect updates state that is in its own dependency array without a termination condition. Passing `[]` does not cause a loop.'
          },
          {
            id: 'D',
            text: 'It executes synchronously before the DOM is painted on the screen.',
            isCorrect: false,
            misconceptionId: 'useeffect-vs-uselayouteffect',
            misconceptionLabel: 'useEffect vs useLayoutEffect Timing Conflation',
            misconceptionExplanation: '`useEffect` is asynchronous and deferred until after the browser paints. `useLayoutEffect` runs synchronously before paint.'
          }
        ],
        remediation: {
          conceptExplanation: 'React compares the values in the dependency array across renders using `Object.is()`. With `[]`, there are no values to change, so the effect callback is never re-invoked after mount.',
          mentalModelFix: 'Treat the dependency array as a dependency declaration contract: "Only run me if something in this list has changed since last time!"',
          followUpQuestion: {
            id: 'react-q1-followup',
            question: 'If an effect uses a variable `userId` from props inside its callback, what should be in the dependency array?',
            options: [
              { id: 'A', text: '`[userId]`', isCorrect: true, explanation: 'Correct! Any reactive value (prop or state) referenced in the effect must be declared in dependencies.' },
              { id: 'B', text: '`[]`', isCorrect: false, explanation: 'Using [] when referencing props leads to stale closure bugs.' },
              { id: 'C', text: '`[props]`', isCorrect: false, explanation: 'Passing the whole props object causes unnecessary runs on unrelated prop changes.' }
            ]
          }
        }
      },
      {
        id: 'react-q2',
        conceptId: 'effect-cleanup',
        conceptName: 'Cleanup Function Lifecycle & Execution Timing',
        prereqId: 'effect-deps',
        difficulty: 'intermediate',
        question: 'When does the cleanup function returned from `useEffect` execute?',
        code: `useEffect(() => {\n  const sub = dataSource.subscribe();\n  return () => {\n    sub.unsubscribe();\n  };\n}, [dataSource]);`,
        options: [
          {
            id: 'A',
            text: 'Only once when the component completely unmounts from the DOM.',
            isCorrect: false,
            misconceptionId: 'cleanup-only-on-unmount',
            misconceptionLabel: 'Cleanup Only on Unmount Misconception',
            misconceptionExplanation: 'You assumed the cleanup function only runs on unmount. If dependencies change, React runs the previous render\'s cleanup function BEFORE running the effect for the new render!'
          },
          {
            id: 'B',
            text: 'Before every re-run of the effect (when dependencies change) AND when the component unmounts.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! React runs cleanup before running the effect with new dependencies, as well as upon final unmount.'
          },
          {
            id: 'C',
            text: 'Immediately after the effect callback finishes executing.',
            isCorrect: false,
            misconceptionId: 'cleanup-immediate-execution',
            misconceptionLabel: 'Immediate Cleanup Execution Misconception',
            misconceptionExplanation: 'The cleanup function is returned as a teardown callback, not executed immediately.'
          },
          {
            id: 'D',
            text: 'Only if an uncaught Error is thrown inside the effect.',
            isCorrect: false,
            misconceptionId: 'cleanup-as-error-handler',
            misconceptionLabel: 'Cleanup as Error Handler Conflation',
            misconceptionExplanation: 'Cleanup is for normal lifecycle resource teardown, not error boundaries.'
          }
        ],
        remediation: {
          conceptExplanation: 'React cleans up the previous render\'s side effects before applying the next render\'s side effects, ensuring zero overlapping subscriptions or memory leaks.',
          mentalModelFix: 'Every render with an effect cleans up after its own past self before the new version starts working.',
          followUpQuestion: {
            id: 'react-q2-followup',
            question: 'What happens in React 18 Strict Mode during development when a component mounts?',
            options: [
              { id: 'A', text: 'React mounts -> cleans up -> re-mounts the effect to test resilience', isCorrect: true, explanation: 'Correct! React 18 Strict Mode double-invokes effects in development to ensure proper teardown.' },
              { id: 'B', text: 'React disables all cleanup functions in development', isCorrect: false, explanation: 'Strict Mode actively verifies cleanups.' },
              { id: 'C', text: 'React throws a warning if a cleanup function is returned', isCorrect: false, explanation: 'Cleanup functions are standard best practice.' }
            ]
          }
        }
      },
      // Advanced
      {
        id: 'react-q3',
        conceptId: 'stale-closures',
        conceptName: 'Stale Closures inside Asynchronous Handlers',
        prereqId: 'effect-deps',
        difficulty: 'advanced',
        question: 'What is the bug in the following timer implementation?',
        code: `const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  const timer = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);`,
        options: [
          {
            id: 'A',
            text: 'The timer resets `count` to 0 every second.',
            isCorrect: false,
            misconceptionId: 'timer-reset-conflation',
            misconceptionLabel: 'Timer Reset Conflation',
            misconceptionExplanation: 'The timer does not reset count; it continuously reads the captured `count = 0`.'
          },
          {
            id: 'B',
            text: '`count` increments from 0 to 1 and stays stuck at 1 forever due to a stale closure.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The effect ran once on mount and closed over `count = 0`. Every second it computes `0 + 1 = 1`, so count never advances past 1!'
          },
          {
            id: 'C',
            text: '`setInterval` is forbidden inside `useEffect`.',
            isCorrect: false,
            misconceptionId: 'api-ban-myth',
            misconceptionLabel: 'Web API Prohibition Myth',
            misconceptionExplanation: 'Timers and intervals are standard idiomatic side effects inside `useEffect`.'
          },
          {
            id: 'D',
            text: 'It triggers an immediate infinite re-render loop on mount.',
            isCorrect: false,
            misconceptionId: 'timer-infinite-loop-confusion',
            misconceptionLabel: 'Interval Infinite Loop Misconception',
            misconceptionExplanation: 'Because `[]` is used, the effect does not re-run on state updates; the bug is stale closure, not a render loop.'
          }
        ],
        remediation: {
          conceptExplanation: 'When an effect callback does not declare state variables in its dependency array, it captures the values from the initial render permanently (stale closure).',
          mentalModelFix: 'When updating state based on previous state inside timers or event listeners, always use the functional updater: `setCount(prev => prev + 1)`.',
          followUpQuestion: {
            id: 'react-q3-followup',
            question: 'How do you fix this counter so it increments continuously without restarting the interval every second?',
            options: [
              { id: 'A', text: '`setCount(c => c + 1)` with `[]` dependencies', isCorrect: true, explanation: 'Correct! Functional update accesses the guaranteed fresh state without needing `count` in deps.' },
              { id: 'B', text: 'Add `count` to `[count]`, tearing down and recreating the interval every second', isCorrect: false, explanation: 'Recreating intervals every second introduces timer jitter and drift.' },
              { id: 'C', text: 'Use `count++` directly', isCorrect: false, explanation: 'Direct state mutation is strictly forbidden in React.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'sql-joins',
    title: 'SQL Joins & Relational Algebra',
    category: 'Databases',
    description: 'Diagnoses mental models of relational join semantics, NULL equality, and ON vs WHERE filtering.',
    concepts: [
      { id: 'inner-vs-left', name: 'INNER JOIN vs LEFT OUTER JOIN Filtering Invariants', prereq: null },
      { id: 'null-logic', name: 'Three-Valued Logic (NULL = NULL Evaluates to UNKNOWN)', prereq: 'inner-vs-left' },
      { id: 'on-vs-where', name: 'Predicate Placement (ON Clause vs WHERE Clause)', prereq: 'inner-vs-left' }
    ],
    questions: [
      // Foundational
      {
        id: 'sql-found-1',
        conceptId: 'inner-vs-left',
        conceptName: 'INNER JOIN vs LEFT OUTER JOIN Filtering Invariants',
        prereqId: null,
        difficulty: 'foundational',
        question: 'Given `Students` (5 rows, 1 has no assigned class) and `Classes` (4 rows). How many rows does a `LEFT JOIN` preserve from the `Students` table?',
        code: `SELECT s.name, c.class_name\nFROM Students s\nLEFT JOIN Classes c ON s.class_id = c.id;`,
        options: [
          {
            id: 'A',
            text: 'All 5 rows from `Students` are preserved, with NULL for the unassigned class.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! A LEFT JOIN guarantees that every row from the left table (`Students`) is retained, filling missing right-side columns with NULL.'
          },
          {
            id: 'B',
            text: 'Only 4 rows, because unmatched students are discarded.',
            isCorrect: false,
            misconceptionId: 'left-join-as-inner-join-myth',
            misconceptionLabel: 'LEFT JOIN as INNER JOIN Misconception',
            misconceptionExplanation: 'You confused LEFT JOIN with INNER JOIN. INNER JOIN discards unmatched rows; LEFT JOIN preserves all left rows unconditionally.'
          },
          {
            id: 'C',
            text: '20 rows (Cartesian product).',
            isCorrect: false,
            misconceptionId: 'join-cartesian-conflation',
            misconceptionLabel: 'Join Cartesian Conflation',
            misconceptionExplanation: 'With an ON clause, only matching rows or single NULL-padded rows are created.'
          },
          {
            id: 'D',
            text: '0 rows if any student has a NULL class_id.',
            isCorrect: false,
            misconceptionId: 'null-aborts-query-myth',
            misconceptionLabel: 'NULL Aborts Query Fallacy',
            misconceptionExplanation: 'SQL handles NULL foreign keys gracefully in outer joins.'
          }
        ],
        remediation: {
          conceptExplanation: '`LEFT OUTER JOIN` preserves all rows from the left-hand table. If a match exists in the right table, the columns are combined; if no match exists, the right columns are populated with `NULL`.',
          mentalModelFix: 'LEFT JOIN means "Keep the left table intact, attach what matches from the right table, fill gaps with NULL".',
          followUpQuestion: {
            id: 'sql-found-1-followup',
            question: 'What query retrieves students who have NO assigned class?',
            options: [
              { id: 'A', text: '`LEFT JOIN Classes c ON ... WHERE c.id IS NULL`', isCorrect: true, explanation: 'Correct! This is the standard Anti-Join pattern in SQL.' },
              { id: 'B', text: '`INNER JOIN Classes c ON ... WHERE c.id = NULL`', isCorrect: false, explanation: 'INNER JOIN already eliminated unmatched students, and = NULL is invalid.' },
              { id: 'C', text: '`CROSS JOIN Classes c WHERE c.id IS NOT NULL`', isCorrect: false, explanation: 'CROSS JOIN combines all rows without checking matching keys.' }
            ]
          }
        }
      },
      // Intermediate
      {
        id: 'sql-q1',
        conceptId: 'inner-vs-left',
        conceptName: 'INNER JOIN vs LEFT OUTER JOIN Filtering Invariants',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'Given an `Employees` table with 10 rows (2 have `department_id = NULL`), and a `Departments` table. How many rows does `SELECT * FROM Employees INNER JOIN Departments ON Employees.department_id = Departments.id` return at most?',
        code: `-- Employees: 10 rows (2 with NULL department_id)\n-- Departments: 5 rows\nSELECT e.name, d.dept_name\nFROM Employees e\nINNER JOIN Departments d ON e.department_id = d.id;`,
        options: [
          {
            id: 'A',
            text: 'At most 10 rows',
            isCorrect: false,
            misconceptionId: 'left-join-mental-model',
            misconceptionLabel: 'Assuming INNER JOIN Preserves Left Unmatched Rows',
            misconceptionExplanation: 'You confused INNER JOIN with LEFT JOIN. An INNER JOIN discards any rows that fail the join condition. Since 2 employees have NULL department_id, at most 8 rows can match!'
          },
          {
            id: 'B',
            text: 'At most 8 rows',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The 2 employees with NULL department_id can never satisfy `NULL = d.id`, so at most 8 rows are returned.'
          },
          {
            id: 'C',
            text: 'Exactly 5 rows (limited by Departments)',
            isCorrect: false,
            misconceptionId: 'cardinality-bottleneck-myth',
            misconceptionLabel: 'Right-Table Cardinality Ceiling Fallacy',
            misconceptionExplanation: 'Multiple employees can belong to the same department (one-to-many relationship), so the row count is not bounded by department count.'
          },
          {
            id: 'D',
            text: '50 rows',
            isCorrect: false,
            misconceptionId: 'cartesian-product-conflation',
            misconceptionLabel: 'Cartesian Product Conflation',
            misconceptionExplanation: 'An INNER JOIN with an ON condition only pairs matching keys, unlike an unconditional CROSS JOIN.'
          }
        ],
        remediation: {
          conceptExplanation: 'INNER JOIN filters out rows from both tables that do not have a matching key. In SQL, `NULL = anything` evaluates to `UNKNOWN` (falsy), so NULL foreign keys are excluded.',
          mentalModelFix: 'INNER JOIN is an intersection. If an employee has no department (NULL), they are omitted from the intersection.',
          followUpQuestion: {
            id: 'sql-q1-followup',
            question: 'If you want to include all 10 employees regardless of whether they have a department, which join do you use?',
            options: [
              { id: 'A', text: '`LEFT JOIN Departments ON ...`', isCorrect: true, explanation: 'Correct! LEFT JOIN preserves all rows from the left table.' },
              { id: 'B', text: '`RIGHT JOIN Departments ON ...`', isCorrect: false, explanation: 'RIGHT JOIN preserves all departments, not employees.' },
              { id: 'C', text: '`CROSS JOIN Departments`', isCorrect: false, explanation: 'CROSS JOIN generates all pairwise combinations.' }
            ]
          }
        }
      },
      {
        id: 'sql-q2',
        conceptId: 'null-logic',
        conceptName: 'Three-Valued Logic (NULL = NULL Evaluates to UNKNOWN)',
        prereqId: 'inner-vs-left',
        difficulty: 'intermediate',
        question: 'If Table A has one row with `val = NULL`, and Table B has one row with `val = NULL`. What is returned by `SELECT * FROM A INNER JOIN B ON A.val = B.val`?',
        code: `-- Table A: 1 row where val is NULL\n-- Table B: 1 row where val is NULL\nSELECT *\nFROM A\nINNER JOIN B ON A.val = B.val;`,
        options: [
          {
            id: 'A',
            text: '1 matching row',
            isCorrect: false,
            misconceptionId: 'null-equality-fallacy',
            misconceptionLabel: 'NULL Equals NULL Fallacy',
            misconceptionExplanation: 'You assumed `NULL = NULL` evaluates to `TRUE`. In SQL three-valued logic, `NULL` represents an UNKNOWN value. `UNKNOWN = UNKNOWN` evaluates to `UNKNOWN`, which the JOIN condition treats as false!'
          },
          {
            id: 'B',
            text: '0 rows (empty result set)',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In SQL, NULL is never equal to NULL. The join condition `A.val = B.val` evaluates to UNKNOWN, resulting in 0 matched rows.'
          },
          {
            id: 'C',
            text: '2 rows',
            isCorrect: false,
            misconceptionId: 'null-doubling-fallacy',
            misconceptionLabel: 'Row Doubling Fallacy',
            misconceptionExplanation: 'SQL joins do not duplicate unmatched rows.'
          },
          {
            id: 'D',
            text: 'SQL Syntax Error: cannot join on NULL',
            isCorrect: false,
            misconceptionId: 'syntax-invalidity-myth',
            misconceptionLabel: 'Syntax Invalidity Myth',
            misconceptionExplanation: 'Joining on nullable columns is valid SQL syntax; it simply yields no matches where values are NULL.'
          }
        ],
        remediation: {
          conceptExplanation: 'SQL uses three-valued logic (TRUE, FALSE, UNKNOWN). A comparison involving NULL with standard `=` operators always yields UNKNOWN. Join conditions require TRUE to match.',
          mentalModelFix: 'NULL means "I don\'t know what is in this box". Two unopened mystery boxes are NOT guaranteed to contain the same thing!',
          followUpQuestion: {
            id: 'sql-q2-followup',
            question: 'How can you match rows where both values are NULL in modern SQL (PostgreSQL/SQLite)?',
            options: [
              { id: 'A', text: '`ON A.val IS NOT DISTINCT FROM B.val`', isCorrect: true, explanation: 'Correct! IS NOT DISTINCT FROM treats two NULLs as matching.' },
              { id: 'B', text: '`ON A.val == B.val`', isCorrect: false, explanation: 'SQL uses single =, not ==.' },
              { id: 'C', text: '`ON A.val = NULL`', isCorrect: false, explanation: '= NULL always evaluates to UNKNOWN.' }
            ]
          }
        }
      },
      // Advanced
      {
        id: 'sql-q3',
        conceptId: 'on-vs-where',
        conceptName: 'Predicate Placement (ON Clause vs WHERE Clause)',
        prereqId: 'inner-vs-left',
        difficulty: 'advanced',
        question: 'What is the critical difference between placing a filter in the ON clause vs the WHERE clause of a LEFT JOIN?',
        code: `-- Query 1 (Filter in ON clause):\nSELECT e.name, d.dept_name\nFROM Employees e\nLEFT JOIN Departments d ON e.dept_id = d.id AND d.dept_name = 'Engineering';\n\n-- Query 2 (Filter in WHERE clause):\nSELECT e.name, d.dept_name\nFROM Employees e\nLEFT JOIN Departments d ON e.dept_id = d.id\nWHERE d.dept_name = 'Engineering';`,
        options: [
          {
            id: 'A',
            text: 'Both queries return identical results because the query optimizer reorders filters.',
            isCorrect: false,
            misconceptionId: 'optimizer-filter-reorder-myth',
            misconceptionLabel: 'Optimizer Semantic Invariance Fallacy',
            misconceptionExplanation: 'You assumed the query planner treats ON and WHERE identically in outer joins. In a LEFT JOIN, moving a right-table predicate to the WHERE clause converts the LEFT JOIN into an INNER JOIN!'
          },
          {
            id: 'B',
            text: 'Query 1 preserves all employees (with NULL dept if not Engineering); Query 2 discards all employees who are not in Engineering.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In Query 1, the filter controls what gets joined. In Query 2, the WHERE clause filters AFTER the join, eliminating rows where `d.dept_name` is NULL or not Engineering.'
          },
          {
            id: 'C',
            text: 'Query 1 returns only Engineering employees; Query 2 returns all employees.',
            isCorrect: false,
            misconceptionId: 'inverted-filter-semantics',
            misconceptionLabel: 'Inverted Filter Semantics',
            misconceptionExplanation: 'This is the exact opposite of how outer joins evaluate predicates.'
          },
          {
            id: 'D',
            text: 'Query 1 is invalid SQL because multiple conditions cannot be placed in an ON clause.',
            isCorrect: false,
            misconceptionId: 'on-clause-syntax-myth',
            misconceptionLabel: 'ON Clause Syntax Myth',
            misconceptionExplanation: 'The ON clause accepts arbitrary boolean expressions using AND / OR.'
          }
        ],
        remediation: {
          conceptExplanation: 'In a `LEFT JOIN`, the `ON` condition determines which rows from the right table qualify for the join. The `WHERE` condition filters rows AFTER the join has already occurred.',
          mentalModelFix: 'Filter in ON = "Only join right rows that match this criteria, but keep all left rows". Filter in WHERE = "Filter the final result set, discarding unmatched rows".',
          followUpQuestion: {
            id: 'sql-q3-followup',
            question: 'Why does `WHERE right_table.col = \'val\'` convert a LEFT JOIN into an INNER JOIN?',
            options: [
              { id: 'A', text: 'Because unmatched left rows have `NULL` in right columns, and `NULL = \'val\'` evaluates to UNKNOWN (falsy), filtering them out', isCorrect: true, explanation: 'Spot on! Any comparison with NULL in WHERE discards the outer rows.' },
              { id: 'B', text: 'Because the database engine crashes on NULL values in WHERE', isCorrect: false, explanation: 'SQL evaluates NULL as UNKNOWN and simply discards the row.' },
              { id: 'C', text: 'Because LEFT JOIN is deprecated in SQL:2016', isCorrect: false, explanation: 'LEFT JOIN is a core SQL feature.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'docker-networking',
    title: 'Docker Networking & Container Communication',
    category: 'Cloud & DevOps',
    description: 'Diagnoses mental models of bridge networks, port bindings, host vs container resolution, and DNS discovery.',
    concepts: [
      { id: 'port-binding', name: 'Host vs Container Port Forwarding Invariants', prereq: null },
      { id: 'embedded-dns', name: 'Docker Embedded DNS & Service Discovery', prereq: 'port-binding' },
      { id: 'bridge-vs-host', name: 'Bridge vs Host Network Isolation Boundaries', prereq: 'embedded-dns' }
    ],
    questions: [
      // Foundational
      {
        id: 'docker-found-1',
        conceptId: 'port-binding',
        conceptName: 'Host vs Container Port Forwarding Invariants',
        prereqId: null,
        difficulty: 'foundational',
        question: 'In `docker run -d -p 8080:80 nginx`, which port on the host machine accepts external HTTP traffic?',
        code: `docker run -d --name web -p 8080:80 nginx`,
        options: [
          {
            id: 'A',
            text: 'Port 80 on the host',
            isCorrect: false,
            misconceptionId: 'port-mapping-inversion',
            misconceptionLabel: 'Port Mapping Direction Inversion',
            misconceptionExplanation: 'You inverted the syntax. Docker `-p` format is strictly `HOST:CONTAINER`. Port 8080 is exposed on the host, forwarding to port 80 inside the container.'
          },
          {
            id: 'B',
            text: 'Port 8080 on the host',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The format is `-p <host_port>:<container_port>`. Port 8080 is opened on the host.'
          },
          {
            id: 'C',
            text: 'Both port 80 and port 8080 on the host',
            isCorrect: false,
            misconceptionId: 'dual-port-binding-fallacy',
            misconceptionLabel: 'Dual Port Binding Fallacy',
            misconceptionExplanation: 'Only the host port (8080) is bound on host interfaces.'
          },
          {
            id: 'D',
            text: 'Neither; `-p` only enables inter-container communication without opening host ports',
            isCorrect: false,
            misconceptionId: 'publish-vs-expose-confusion',
            misconceptionLabel: 'Publish vs Expose Conflation',
            misconceptionExplanation: '`-p` actively publishes the port to the host network interfaces.'
          }
        ],
        remediation: {
          conceptExplanation: 'Docker port publishing follows `-p HOST:CONTAINER`. The left side defines the listening port on the host operating system; the right side defines the destination port inside the container.',
          mentalModelFix: 'Read `-p 8080:80` as "From outside (host 8080) -> into inside (container 80)".',
          followUpQuestion: {
            id: 'docker-found-1-followup',
            question: 'If two containers both listen on port 80 inside, can they run on the same host with `-p 8001:80` and `-p 8002:80`?',
            options: [
              { id: 'A', text: 'Yes, because host ports (8001 and 8002) are distinct and do not conflict', isCorrect: true, explanation: 'Correct! Container port namespaces are completely isolated from each other.' },
              { id: 'B', text: 'No, Docker forbids multiple containers using port 80 internally', isCorrect: false, explanation: 'Containers have private network namespaces and can share internal port numbers.' },
              { id: 'C', text: 'Only if running in host networking mode', isCorrect: false, explanation: 'Host networking mode would cause a port conflict.' }
            ]
          }
        }
      },
      // Intermediate
      {
        id: 'docker-q1',
        conceptId: 'port-binding',
        conceptName: 'Host vs Container Port Forwarding Invariants',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'When running `docker run -d -p 8080:80 nginx`, which port on the host machine accepts external traffic?',
        code: `docker run -d --name web -p 8080:80 nginx`,
        options: [
          {
            id: 'A',
            text: 'Port 80',
            isCorrect: false,
            misconceptionId: 'port-direction-inversion',
            misconceptionLabel: 'Port Mapping Direction Inversion',
            misconceptionExplanation: 'The syntax for Docker port publishing is `-p <host_port>:<container_port>`. Port 8080 is on the host, forwarding to port 80 in the container.'
          },
          {
            id: 'B',
            text: 'Port 8080',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The host listens on 8080 and forwards packets into the container\'s port 80.'
          },
          {
            id: 'C',
            text: 'A random high-order port assigned by the kernel',
            isCorrect: false,
            misconceptionId: 'ephemeral-port-confusion',
            misconceptionLabel: 'Dynamic Ephemeral Port Conflation',
            misconceptionExplanation: 'Ephemeral ports are assigned only with `-P` (uppercase), not `-p 8080:80`.'
          },
          {
            id: 'D',
            text: 'Port 443',
            isCorrect: false,
            misconceptionId: 'https-default-assumption',
            misconceptionLabel: 'HTTPS Default Assumption',
            misconceptionExplanation: 'Standard Nginx image defaults to HTTP on port 80.'
          }
        ],
        remediation: {
          conceptExplanation: 'Port publishing `-p <host>:<container>` creates a DNAT iptables rule mapping incoming host traffic into the container\'s virtual network interface.',
          mentalModelFix: 'Outside:Inside. You knock on the host door (8080), which escorts you to the container room (80).',
          followUpQuestion: {
            id: 'docker-q1-followup',
            question: 'What command publishes a random free host port to container port 80?',
            options: [
              { id: 'A', text: '`docker run -p 80 nginx`', isCorrect: true, explanation: 'Correct! Omitting the host port tells Docker to bind a random ephemeral host port.' },
              { id: 'B', text: '`docker run -p 0:80 nginx`', isCorrect: false, explanation: 'While 0 works, -p 80 is the canonical shorthand.' },
              { id: 'C', text: '`docker run --random-ports nginx`', isCorrect: false, explanation: 'The flag is -P, not --random-ports.' }
            ]
          }
        }
      },
      // Advanced
      {
        id: 'docker-q2',
        conceptId: 'embedded-dns',
        conceptName: 'Docker Embedded DNS & Service Discovery',
        prereqId: 'port-binding',
        difficulty: 'advanced',
        question: 'Why can two containers communicate by container name on a custom user-defined bridge network, but fail on the default bridge network?',
        code: `# Setup A (Default Bridge):\ndocker run -d --name api app-image\ndocker run -d --name db db-image\n# In container 'api': ping db -> Fails with unknown host\n\n# Setup B (Custom Bridge):\ndocker network create my-net\ndocker run -d --network my-net --name api app-image\ndocker run -d --network my-net --name db db-image\n# In container 'api': ping db -> Succeeds!`,
        options: [
          {
            id: 'A',
            text: 'The default bridge disables all TCP/IP traffic between containers.',
            isCorrect: false,
            misconceptionId: 'inter-container-traffic-disabled-myth',
            misconceptionLabel: 'Inter-Container Traffic Disabled Myth',
            misconceptionExplanation: 'Containers on the default bridge CAN communicate if using IP addresses directly; it is DNS resolution by name that is disabled.'
          },
          {
            id: 'B',
            text: 'Docker provides automatic embedded DNS service discovery (127.0.0.11) only on user-defined bridge networks, not on the default bridge.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Docker\'s built-in DNS server operates exclusively on custom networks. The default bridge requires legacy `--link` flags.'
          },
          {
            id: 'C',
            text: 'Custom bridge networks bypass iptables packet filtering.',
            isCorrect: false,
            misconceptionId: 'iptables-bypass-myth',
            misconceptionLabel: 'iptables Bypass Myth',
            misconceptionExplanation: 'Both bridge networks use iptables for routing and NAT.'
          },
          {
            id: 'D',
            text: 'The default bridge only supports IPv6 addressing.',
            isCorrect: false,
            misconceptionId: 'ipv6-only-myth',
            misconceptionLabel: 'IPv6 Default Fallacy',
            misconceptionExplanation: 'Default Docker bridge uses standard IPv4 172.17.0.0/16 subnets.'
          }
        ],
        remediation: {
          conceptExplanation: 'Docker runs an internal DNS server at `127.0.0.11` on custom bridge networks that dynamically resolves container names to IP addresses. The legacy default bridge (`bridge`) intentionally lacks this feature for backwards compatibility.',
          mentalModelFix: 'Always create a custom user network (`docker network create`) or use Docker Compose. Never rely on the default bridge for multi-container apps.',
          followUpQuestion: {
            id: 'docker-q2-followup',
            question: 'What is the primary IP address of the Docker embedded DNS server inside containers?',
            options: [
              { id: 'A', text: '`127.0.0.11`', isCorrect: true, explanation: 'Correct! 127.0.0.11 is the standard loopback IP for Docker embedded DNS.' },
              { id: 'B', text: '`8.8.8.8`', isCorrect: false, explanation: '8.8.8.8 is Google Public DNS, not the container resolver.' },
              { id: 'C', text: '`172.17.0.1`', isCorrect: false, explanation: '172.17.0.1 is the default bridge gateway, not the DNS server loopback.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'python-decorators',
    title: 'Python Decorators & Higher-Order Functions',
    category: 'Computer Science',
    description: 'Diagnoses mental models of closure wrappers, decoration-time vs call-time execution, and functools.wraps metadata preservation.',
    concepts: [
      { id: 'decoration-time', name: 'Decoration Time vs Execution Time Evaluation', prereq: null },
      { id: 'wrapper-args', name: 'Wrapper Function Argument Forwarding (*args, **kwargs)', prereq: 'decoration-time' },
      { id: 'functools-wraps', name: 'Metadata Preservation with functools.wraps', prereq: 'wrapper-args' }
    ],
    questions: [
      {
        id: 'py-dec-q1',
        conceptId: 'decoration-time',
        conceptName: 'Decoration Time vs Execution Time Evaluation',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'When is the code inside the outer decorator function executed in the following snippet?',
        code: `def my_decorator(func):\n    print("Decorating function")\n    def wrapper():\n        print("Inside wrapper")\n        return func()\n    return wrapper\n\n@my_decorator\ndef greet():\n    print("Hello world")\n\n# Notice: greet() is NOT called yet!`,
        options: [
          {
            id: 'A',
            text: 'Nothing is printed because `greet()` has not been called yet.',
            isCorrect: false,
            misconceptionId: 'call-time-execution-fallacy',
            misconceptionLabel: 'Decoration as Deferred Call-Time Hook Myth',
            misconceptionExplanation: 'You assumed decorators only run when the decorated function is invoked. `@my_decorator` is syntactic sugar for `greet = my_decorator(greet)`, which runs immediately when the module is imported or defined!'
          },
          {
            id: 'B',
            text: 'It prints "Decorating function" immediately at definition time.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Decorator definition executes immediately upon function creation. "Inside wrapper" only prints when `greet()` is called.'
          },
          {
            id: 'C',
            text: 'It prints both "Decorating function" and "Inside wrapper".',
            isCorrect: false,
            misconceptionId: 'wrapper-auto-exec-myth',
            misconceptionLabel: 'Wrapper Auto-Execution Myth',
            misconceptionExplanation: 'The inner `wrapper` is only defined, not invoked until `greet()` is called.'
          },
          {
            id: 'D',
            text: 'It raises a SyntaxError because greet is not called.',
            isCorrect: false,
            misconceptionId: 'decorator-syntax-confusion',
            misconceptionLabel: 'Decorator Syntax Uncertainty',
            misconceptionExplanation: 'This is standard, valid Python decorator syntax.'
          }
        ],
        remediation: {
          conceptExplanation: '`@decorator` is evaluated at function definition time (import time). The outer decorator executes immediately and returns the wrapper.',
          mentalModelFix: 'Decoration happens at compile/import time; execution happens at call time. Don\'t put request-specific logic in the outer decorator body!',
          followUpQuestion: {
            id: 'py-dec-q1-followup',
            question: 'What is `@decorator` mathematically equivalent to in Python syntax?',
            options: [
              { id: 'A', text: '`fn = decorator(fn)`', isCorrect: true, explanation: 'Correct! Decoration is simply function reassignment.' },
              { id: 'B', text: '`fn = fn(decorator)`', isCorrect: false, explanation: 'The decorator wraps the function, not vice versa.' },
              { id: 'C', text: '`fn.append(decorator)`', isCorrect: false, explanation: 'Functions do not have an append method.' }
            ]
          }
        }
      },
      {
        id: 'py-dec-q2',
        conceptId: 'functools-wraps',
        conceptName: 'Preserving Metadata with functools.wraps',
        prereqId: 'decoration-time',
        difficulty: 'intermediate',
        question: 'What is the output of `print(greet.__name__)` if a decorator wrapper does NOT use `@functools.wraps`?',
        code: `def my_logger(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@my_logger\ndef greet():\n    pass\n\nprint(greet.__name__)`,
        options: [
          {
            id: 'A',
            text: 'greet',
            isCorrect: false,
            misconceptionId: 'metadata-auto-preservation-myth',
            misconceptionLabel: 'Automatic Metadata Preservation Myth',
            misconceptionExplanation: 'You assumed Python automatically preserves function attributes when wrapped. Without `@functools.wraps`, `greet` points to `wrapper`, so `__name__` evaluates to `"wrapper"`!'
          },
          {
            id: 'B',
            text: 'wrapper',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The decorated function was replaced with the inner `wrapper` function object, adopting its metadata unless `@functools.wraps` is applied.'
          },
          {
            id: 'C',
            text: 'None',
            isCorrect: false,
            misconceptionId: 'name-attribute-nullification',
            misconceptionLabel: 'Name Attribute Nullification Misconception',
            misconceptionExplanation: 'Every function in Python has a string `__name__`.'
          },
          {
            id: 'D',
            text: 'AttributeError: function has no attribute __name__',
            isCorrect: false,
            misconceptionId: 'dunder-name-invalid-assumption',
            misconceptionLabel: 'Dunder Name Invalidity Assumption',
            misconceptionExplanation: '`__name__` is a standard built-in attribute on all functions.'
          }
        ],
        remediation: {
          conceptExplanation: 'Decorators replace the original function with a wrapper function. Use `@functools.wraps(func)` on the wrapper to copy `__name__`, `__doc__`, and annotations.',
          mentalModelFix: 'Always wrap your wrapper with `@wraps(func)`. It preserves identity for logging, debugging, and introspection.',
          followUpQuestion: {
            id: 'py-dec-q2-followup',
            question: 'What module provides the `wraps` utility in Python standard library?',
            options: [
              { id: 'A', text: '`functools`', isCorrect: true, explanation: 'Correct! from functools import wraps is the standard tool.' },
              { id: 'B', text: '`sys`', isCorrect: false, explanation: 'sys handles system parameters.' },
              { id: 'C', text: '`inspect`', isCorrect: false, explanation: 'inspect is for inspecting live objects.' }
            ]
          }
        }
      },
      {
        id: 'py-dec-q3',
        conceptId: 'wrapper-args',
        conceptName: 'Wrapper Function Scope & Closure Retention',
        prereqId: 'decoration-time',
        difficulty: 'advanced',
        question: 'How can a decorator keep track of function call counts without polluting the global namespace?',
        code: `def count_calls(func):\n    count = 0\n    def wrapper(*args, **kwargs):\n        nonlocal count\n        count += 1\n        print(f"Call {count}")\n        return func(*args, **kwargs)\n    return wrapper`,
        options: [
          {
            id: 'A',
            text: 'Using a `nonlocal count` variable in the enclosing decorator scope.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The enclosing decorator scope forms a private closure over `count`, and `nonlocal` permits modifying it across invocations.'
          },
          {
            id: 'B',
            text: 'Using `global count` inside the wrapper.',
            isCorrect: false,
            misconceptionId: 'global-scope-pollution',
            misconceptionLabel: 'Global Scope Pollution Anti-Pattern',
            misconceptionExplanation: 'Using `global` pollutes the module namespace and collides if multiple functions are decorated.'
          },
          {
            id: 'C',
            text: 'Decorators cannot maintain state between calls in Python.',
            isCorrect: false,
            misconceptionId: 'stateless-decorator-myth',
            misconceptionLabel: 'Stateless Decorator Myth',
            misconceptionExplanation: 'Decorators are closures and can maintain private persistent state in enclosing scopes.'
          },
          {
            id: 'D',
            text: 'By passing `count` as an extra parameter to `func`.',
            isCorrect: false,
            misconceptionId: 'signature-mutation-fallacy',
            misconceptionLabel: 'Signature Mutation Fallacy',
            misconceptionExplanation: 'Mutating the original function signature breaks external callers.'
          }
        ],
        remediation: {
          conceptExplanation: 'Decorators are higher-order functions that return closures. The enclosing scope acts as an isolated, private memory cell across invocations.',
          mentalModelFix: 'Enclosing decorator scope + `nonlocal` = clean, private state persistence without globals.',
          followUpQuestion: {
            id: 'py-dec-q3-followup',
            question: 'What happens if you remove `nonlocal count` and write `count += 1` inside `wrapper`?',
            options: [
              { id: 'A', text: 'Python raises `UnboundLocalError: local variable \'count\' referenced before assignment`.', isCorrect: true, explanation: 'Spot on! The assignment makes count local to wrapper, but reading it happens before assignment.' },
              { id: 'B', text: 'It increments the global count variable instead.', isCorrect: false, explanation: 'Python does not fall back to global scope if assignment is detected locally.' },
              { id: 'C', text: 'It compiles and works normally without issue.', isCorrect: false, explanation: 'It throws an UnboundLocalError at runtime on first invocation.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'js-async',
    title: 'JavaScript Event Loop & Concurrency Model',
    category: 'Computer Science',
    description: 'Diagnoses mental models of Microtask queues vs Macrotask timers and non-blocking asynchronous execution.',
    concepts: [
      { id: 'call-stack', name: 'Synchronous Call Stack Execution', prereq: null },
      { id: 'microtask-queue', name: 'Microtask Queue (Promises & process.nextTick)', prereq: 'call-stack' },
      { id: 'macrotask-timer', name: 'Macrotask Queue (setTimeout & setImmediate)', prereq: 'microtask-queue' }
    ],
    questions: [
      {
        id: 'js-q1',
        conceptId: 'microtask-queue',
        conceptName: 'Microtask Queue (Promises & process.nextTick)',
        prereqId: 'call-stack',
        difficulty: 'intermediate',
        question: 'What is the order of printed numbers in the console?',
        code: `console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);`,
        options: [
          {
            id: 'A',
            text: '1, 2, 3, 4',
            isCorrect: false,
            misconceptionId: 'timeout-zero-immediate-exec',
            misconceptionLabel: '`setTimeout(..., 0)` Runs Immediately Misconception',
            misconceptionExplanation: 'You assumed `setTimeout(..., 0)` executes synchronously or ahead of promises. Zero-delay timers are pushed to the MACROTASK queue, which runs only after the call stack empties AND after all MICROTASK jobs (Promise `.then`) finish!'
          },
          {
            id: 'B',
            text: '1, 4, 3, 2',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Synchronous code (1, 4) executes first, followed by microtasks (3), followed by macrotasks (2).'
          },
          {
            id: 'C',
            text: '1, 4, 2, 3',
            isCorrect: false,
            misconceptionId: 'fifo-single-queue-model',
            misconceptionLabel: 'Single Unified Queue Misconception',
            misconceptionExplanation: 'You treated the event loop as having a single FIFO queue. The event loop prioritizes the entire Microtask queue before picking the next Macrotask.'
          },
          {
            id: 'D',
            text: '3, 1, 4, 2',
            isCorrect: false,
            misconceptionId: 'promise-hoisting-fallacy',
            misconceptionLabel: 'Promise Hoisting Fallacy',
            misconceptionExplanation: 'Promises do not interrupt synchronous script evaluation on the call stack.'
          }
        ],
        remediation: {
          conceptExplanation: 'JavaScript has two distinct asynchronous task queues: Microtasks (Promise callbacks, MutationObserver) and Macrotasks (setTimeout, setInterval, I/O).',
          mentalModelFix: 'Rule of thumb: Synchronous stack runs to completion -> Microtask queue is drained completely -> One Macrotask is pulled and executed -> Repeat.',
          followUpQuestion: {
            id: 'js-q1-followup',
            question: 'If a Promise `.then()` callback schedules another Promise `.then()`, when will that new microtask execute relative to a pending `setTimeout(..., 0)`?',
            options: [
              { id: 'A', text: 'Before the `setTimeout` callback runs', isCorrect: true, explanation: 'Correct! The event loop drains all microtasks—even newly scheduled ones—before yielding to macrotask timers.' },
              { id: 'B', text: 'After the `setTimeout` callback runs', isCorrect: false, explanation: 'Incorrect. The microtask queue must be completely empty before a macrotask runs.' },
              { id: 'C', text: 'At exactly the same time in parallel threads', isCorrect: false, explanation: 'Incorrect. JavaScript main thread is single-threaded.' }
            ]
          }
        }
      },
      {
        id: 'js-q2',
        conceptId: 'call-stack',
        conceptName: 'Synchronous Call Stack Execution with async/await',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'What is printed to the console when `main()` is executed?',
        code: `async function main() {\n  console.log("A");\n  await Promise.resolve();\n  console.log("B");\n}\nmain();\nconsole.log("C");`,
        options: [
          {
            id: 'A',
            text: 'A, B, C',
            isCorrect: false,
            misconceptionId: 'await-blocks-main-thread',
            misconceptionLabel: 'Await Blocks Main Thread Misconception',
            misconceptionExplanation: 'You assumed `await` pauses synchronous execution across the entire script. `await` pauses execution INSIDE the async function and yields control back to the caller synchronously. So "C" executes before the resumed "B" microtask!'
          },
          {
            id: 'B',
            text: 'A, C, B',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! "A" runs synchronously. The `await` suspends `main()` and queues the remainder as a microtask. "C" runs synchronously, and "B" runs when microtasks execute.'
          },
          {
            id: 'C',
            text: 'C, A, B',
            isCorrect: false,
            misconceptionId: 'async-entirely-deferred',
            misconceptionLabel: 'Async Function Entirely Deferred Myth',
            misconceptionExplanation: 'Code inside an async function runs synchronously until the first `await` expression.'
          },
          {
            id: 'D',
            text: 'A, C',
            isCorrect: false,
            misconceptionId: 'microtask-unresolved-myth',
            misconceptionLabel: 'Microtask Drop Fallacy',
            misconceptionExplanation: 'The microtask completes and prints "B".'
          }
        ],
        remediation: {
          conceptExplanation: 'An `async` function executes synchronously until it encounters the first `await`. The remainder of the function is packaged into a microtask callback.',
          mentalModelFix: 'Think of `await` as returning control to the caller and scheduling the rest of the function on the Promise microtask queue.',
          followUpQuestion: {
            id: 'js-q2-followup',
            question: 'When does the code after an `await` execute in the event loop?',
            options: [
              { id: 'A', text: 'In the Microtask queue immediately after current synchronous code finishes', isCorrect: true, explanation: 'Correct! Await resumes on the microtask queue.' },
              { id: 'B', text: 'In a separate background OS worker thread', isCorrect: false, explanation: 'JavaScript is single-threaded on the event loop.' },
              { id: 'C', text: 'Only when user clicks the screen', isCorrect: false, explanation: 'Microtasks execute autonomously.' }
            ]
          }
        }
      },
      {
        id: 'js-q3',
        conceptId: 'macrotask-timer',
        conceptName: 'Macrotask vs Microtask Starvation Dynamics',
        prereqId: 'microtask-queue',
        difficulty: 'advanced',
        question: 'What happens if a recursive Promise microtask loop is executed in Node.js or browser?',
        code: `function loop() {\n  Promise.resolve().then(loop);\n}\nloop();\nsetTimeout(() => console.log("Timer!"), 0);`,
        options: [
          {
            id: 'A',
            text: 'The `setTimeout` callback NEVER runs because microtasks starve the macrotask queue indefinitely.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The event loop must drain all microtasks before picking the next macrotask. Recursively scheduling microtasks causes total macrotask starvation!'
          },
          {
            id: 'B',
            text: 'The timer executes after exactly 10 iterations of `loop()`.',
            isCorrect: false,
            misconceptionId: 'fair-scheduler-myth',
            misconceptionLabel: 'Fair Scheduler Round-Robin Myth',
            misconceptionExplanation: 'You assumed the event loop alternates fairly between queues. JavaScript prioritizes draining the ENTIRE microtask queue before any macrotask runs.'
          },
          {
            id: 'C',
            text: 'It throws a `RangeError: Maximum call stack size exceeded`.',
            isCorrect: false,
            misconceptionId: 'call-stack-vs-microtask-conflation',
            misconceptionLabel: 'Call Stack vs Microtask Queue Conflation',
            misconceptionExplanation: 'Because `then()` schedules a microtask, the current stack frame unwinds before each next callback, so stack overflow does not occur; it starves macrotasks instead.'
          },
          {
            id: 'D',
            text: 'The browser kills the loop with an Out-Of-Memory error after 1 millisecond.',
            isCorrect: false,
            misconceptionId: 'instant-oom-fallacy',
            misconceptionLabel: 'Instant OOM Fallacy',
            misconceptionExplanation: 'It freezes the UI thread rather than failing instantly with OOM.'
          }
        ],
        remediation: {
          conceptExplanation: 'The event loop checks for pending macrotasks only when the microtask queue is completely empty. Continuously enqueuing microtasks starves I/O, timers, and UI rendering.',
          mentalModelFix: 'Never schedule infinite microtask loops. If you need repeated background work, use macrotasks (`setTimeout` / `setImmediate`) to yield to other tasks.',
          followUpQuestion: {
            id: 'js-q3-followup',
            question: 'How do you prevent microtask starvation when processing large datasets?',
            options: [
              { id: 'A', text: 'Break the dataset into chunks and yield between chunks with `setTimeout(..., 0)` or `scheduler.yield()`', isCorrect: true, explanation: 'Spot on! Yielding macrotasks allows the event loop to service UI and timers.' },
              { id: 'B', text: 'Increase the microtask queue size in v8 flags', isCorrect: false, explanation: 'The microtask queue has no fixed size limit.' },
              { id: 'C', text: 'Wrap all promises in eval()', isCorrect: false, explanation: 'Eval does not alter scheduling.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'dsa-binary-search',
    title: 'Data Structures: Binary Search & Trees',
    category: 'Computer Science',
    description: 'Diagnoses mental models of logarithmic search invariants, loop boundaries, and recursion call stack mechanics.',
    concepts: [
      { id: 'search-bounds', name: 'Binary Search Boundary Invariants (low <= high vs low < high)', prereq: null },
      { id: 'midpoint-overflow', name: 'Integer Arithmetic Midpoint Overflow', prereq: 'search-bounds' }
    ],
    questions: [
      {
        id: 'dsa-found-1',
        conceptId: 'search-bounds',
        conceptName: 'Logarithmic Search Window Halving',
        prereqId: null,
        difficulty: 'foundational',
        question: 'What is the worst-case number of comparisons to find an element in a sorted array of 1,024 elements using binary search?',
        code: `// Binary search on sorted array of size N = 1024\nbinarySearch(sortedArr, target);`,
        options: [
          {
            id: 'A',
            text: 'At most 10 or 11 comparisons ($O(\\log_2 N)$)',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! $2^{10} = 1024$. Each comparison halves the remaining search space, requiring at most $\\approx \\log_2 1024 = 10$ steps.'
          },
          {
            id: 'B',
            text: '512 comparisons ($N / 2$)',
            isCorrect: false,
            misconceptionId: 'linear-halving-confusion',
            misconceptionLabel: 'Linear Half-Scan Conflation',
            misconceptionExplanation: 'You confused halving repeatedly with doing half of a linear scan. Binary search cuts the remaining window in half at EVERY step, achieving logarithmic time.'
          },
          {
            id: 'C',
            text: '1,024 comparisons ($O(N)$)',
            isCorrect: false,
            misconceptionId: 'linear-search-worst-case',
            misconceptionLabel: 'Linear Search Worst Case Conflation',
            misconceptionExplanation: '1,024 is the worst-case for linear search on an unsorted array, not binary search.'
          },
          {
            id: 'D',
            text: '1 comparison',
            isCorrect: false,
            misconceptionId: 'best-case-confusion',
            misconceptionLabel: 'Best Case Confused for Worst Case',
            misconceptionExplanation: '1 comparison is the best-case (target right at the midpoint), not the worst-case.'
          }
        ],
        remediation: {
          conceptExplanation: 'Binary search repeatedly divides the search space in half. Its time complexity is $O(\\log N)$. For an array of 1 million items, it needs at most 20 comparisons!',
          mentalModelFix: 'Halving at every step turns exponential size into tiny linear steps: $\\log_2(1,000,000) \\approx 20$.',
          followUpQuestion: {
            id: 'dsa-found-1-followup',
            question: 'What is the prerequisite condition for binary search to work correctly on an array?',
            options: [
              { id: 'A', text: 'The array must be strictly sorted by key order', isCorrect: true, explanation: 'Correct! Binary search cannot eliminate halves unless the data is sorted.' },
              { id: 'B', text: 'The array must contain only positive numbers', isCorrect: false, explanation: 'Binary search works on any sorted items.' },
              { id: 'C', text: 'The array size must be a power of 2', isCorrect: false, explanation: 'Any size array works.' }
            ]
          }
        }
      },
      {
        id: 'dsa-q1',
        conceptId: 'search-bounds',
        conceptName: 'Binary Search Boundary Invariants',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'In standard binary search on an array of length N, if `while (low <= high)` is used, how should `high` be updated when `target < arr[mid]`?',
        code: `while (low <= high) {\n  let mid = Math.floor((low + high) / 2);\n  if (arr[mid] === target) return mid;\n  if (target < arr[mid]) high = ???;\n  else low = mid + 1;\n}`,
        options: [
          {
            id: 'A',
            text: 'high = mid',
            isCorrect: false,
            misconceptionId: 'infinite-loop-boundary-trap',
            misconceptionLabel: 'Search Interval Shrinking Blindspot',
            misconceptionExplanation: 'You chose `high = mid`. In a closed interval `[low, high]`, since `arr[mid]` has already been verified not equal to target, failing to exclude `mid` (`high = mid - 1`) causes an infinite loop when `high - low === 1`!'
          },
          {
            id: 'B',
            text: 'high = mid - 1',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Because `low <= high` defines an inclusive interval `[low, high]`, `mid` is already eliminated, requiring `mid - 1`.'
          },
          {
            id: 'C',
            text: 'high = mid / 2',
            isCorrect: false,
            misconceptionId: 'log-formula-confusion',
            misconceptionLabel: 'Formula Conflation',
            misconceptionExplanation: '`high` represents the right index boundary, not the size divided in two.'
          },
          {
            id: 'D',
            text: 'high = low + 1',
            isCorrect: false,
            misconceptionId: 'arbitrary-assignment',
            misconceptionLabel: 'Arbitrary Boundary Assignment',
            misconceptionExplanation: 'This destroys the logarithmic search window.'
          }
        ],
        remediation: {
          conceptExplanation: 'Binary search correctness relies on strict loop invariants. For inclusive search windows `[low, high]`, both boundaries must shrink past `mid` upon mismatch.',
          mentalModelFix: 'Always match condition with updates: If `low <= high`, use `high = mid - 1` and `low = mid + 1`. If `low < high`, use `high = mid`.',
          followUpQuestion: {
            id: 'dsa-q1-followup',
            question: 'If you use `while (low < high)` for half-open interval `[low, high)`, what should `high` be updated to when `target < arr[mid]`?',
            options: [
              { id: 'A', text: '`high = mid`', isCorrect: true, explanation: 'Perfect! Because the right boundary is exclusive, setting `high = mid` properly excludes `mid` from the next pass.' },
              { id: 'B', text: '`high = mid - 1`', isCorrect: false, explanation: 'In a half-open interval, `mid - 1` would inadvertently skip the element at index `mid - 1`.' },
              { id: 'C', text: '`high = low`', isCorrect: false, explanation: 'This abruptly terminates the search without checking remaining candidates.' }
            ]
          }
        }
      },
      {
        id: 'dsa-q2',
        conceptId: 'midpoint-overflow',
        conceptName: 'Integer Arithmetic Midpoint Overflow Invariants',
        prereqId: 'search-bounds',
        difficulty: 'advanced',
        question: 'Why does `mid = (low + high) / 2` cause a critical bug in languages with fixed-width 32-bit signed integers (Java, C++, C#)?',
        code: `// Classic midpoint bug in large arrays\nint mid = (low + high) / 2;`,
        options: [
          {
            id: 'A',
            text: 'If `low + high` exceeds $2^{31} - 1$, integer arithmetic overflows to a negative value, causing an ArrayIndexOutOfBoundsException.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In 32-bit signed integers, values exceeding 2,147,483,647 wrap around to negative numbers, producing a negative index.'
          },
          {
            id: 'B',
            text: 'Division `/ 2` is undefined for odd integers in C++.',
            isCorrect: false,
            misconceptionId: 'integer-division-myth',
            misconceptionLabel: 'Integer Division Myth',
            misconceptionExplanation: 'Integer division truncates toward zero cleanly; it is not undefined.'
          },
          {
            id: 'C',
            text: 'Binary search does not work on arrays with more than 100 elements.',
            isCorrect: false,
            misconceptionId: 'array-size-limit-myth',
            misconceptionLabel: 'Arbitrary Size Limit Myth',
            misconceptionExplanation: 'Binary search scales efficiently to billions of elements.'
          },
          {
            id: 'D',
            text: 'The compiler converts `/ 2` into a multiplication operation.',
            isCorrect: false,
            misconceptionId: 'compiler-inversion-myth',
            misconceptionLabel: 'Compiler Inversion Myth',
            misconceptionExplanation: 'Compilers optimize `/ 2` to bitwise shifts, but overflow already occurred in `low + high`.'
          }
        ],
        remediation: {
          conceptExplanation: 'To prevent integer overflow in large arrays, compute midpoint as `mid = low + (high - low) / 2` or use unsigned bitwise right-shift `(low + high) >>> 1`.',
          mentalModelFix: 'Instead of summing large numbers, add half the distance: `low + (high - low) / 2`.',
          followUpQuestion: {
            id: 'dsa-q2-followup',
            question: 'What is the safe midpoint formula that never overflows?',
            options: [
              { id: 'A', text: '`low + (high - low) / 2`', isCorrect: true, explanation: 'Correct! Subtraction (high - low) is always <= array length, so it never overflows.' },
              { id: 'B', text: '`(low * high) / 2`', isCorrect: false, explanation: 'Multiplication overflows even faster.' },
              { id: 'C', text: '`low + high`', isCorrect: false, explanation: 'This gives twice the midpoint.' }
            ]
          }
        }
      }
    ]
  }
];

/**
 * Universal Topic-Aware Heuristic Question Generator
 * When Gemini AI or Ollama are offline, this function dynamically generates
 * topic-relevant and difficulty-aware MCQs matching the user's specific entered topic.
 */
export function generateTopicAwareQuiz(topicQuery, difficulty = 'intermediate', count = 3) {
  const cleanTitle = (topicQuery || 'General Computer Science').trim();
  const normalized = cleanTitle.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(w => w.length > 2);
  const targetDiff = ['foundational', 'intermediate', 'advanced'].includes(difficulty?.toLowerCase())
    ? difficulty.toLowerCase()
    : 'intermediate';

  // 1. Alias Dictionary for Direct Intent Mapping
  const ALIAS_MAP = {
    'javascript-closures': [
      'javascript closures', 'javascript closure', 'closures', 'closure', 'lexical scope',
      'js closures', 'js closure', 'closures in js', 'closures in javascript', 'scope chain',
      'variable capture'
    ],
    'react-useeffect': [
      'react useeffect', 'useeffect', 'use effect', 'react effect', 'react hook', 'react hooks',
      'effect lifecycle', 'useeffect lifecycle', 'effect hook', 'stale closure in react'
    ],
    'sql-joins': [
      'sql joins', 'sql join', 'inner join', 'left join', 'outer join', 'relational joins',
      'relational join', 'joins in sql', 'sql relational', 'table joins'
    ],
    'python-memory': [
      'python memory', 'python mutability', 'object mutability', 'python mutable',
      'mutable default args', 'shallow copy python', 'python pointers', 'name binding python',
      'mutability in python'
    ],
    'docker-networking': [
      'docker networking', 'docker network', 'container networking', 'container network',
      'docker bridge', 'docker port', 'container communication'
    ],
    'python-decorators': [
      'python decorators', 'python decorator', 'decorator in python', 'higher order functions python',
      'wrapper function python', 'python wrapper'
    ],
    'js-async': [
      'javascript event loop', 'event loop', 'js event loop', 'microtasks', 'macrotasks',
      'js async', 'promise queue', 'call stack javascript'
    ],
    'dsa-binary-search': [
      'binary search', 'binary search tree', 'bst', 'logarithmic search', 'search bounds',
      'dsa binary search'
    ]
  };

  // Find exact alias match
  let matchedTopicId = null;
  for (const [tId, aliases] of Object.entries(ALIAS_MAP)) {
    if (aliases.some(alias => normalized === alias || normalized.includes(alias) || alias.includes(normalized))) {
      matchedTopicId = tId;
      break;
    }
  }

  // If alias didn't match directly, check high-confidence token matches
  if (!matchedTopicId) {
    if (tokens.includes('closure') || tokens.includes('closures')) {
      matchedTopicId = 'javascript-closures';
    } else if (tokens.includes('useeffect') || (tokens.includes('react') && tokens.includes('effect'))) {
      matchedTopicId = 'react-useeffect';
    } else if (tokens.includes('join') || tokens.includes('joins')) {
      matchedTopicId = 'sql-joins';
    } else if (tokens.includes('decorator') || tokens.includes('decorators')) {
      matchedTopicId = 'python-decorators';
    } else if (tokens.includes('docker') && (tokens.includes('network') || tokens.includes('port'))) {
      matchedTopicId = 'docker-networking';
    } else if (tokens.includes('python') && (tokens.includes('memory') || tokens.includes('mutab') || tokens.includes('copy'))) {
      matchedTopicId = 'python-memory';
    } else if (tokens.includes('event') && tokens.includes('loop')) {
      matchedTopicId = 'js-async';
    } else if (tokens.includes('binary') && tokens.includes('search')) {
      matchedTopicId = 'dsa-binary-search';
    }
  }

  // If a curated topic matched: select questions respecting requested difficulty!
  if (matchedTopicId) {
    const curated = FALLBACK_TOPICS.find(t => t.id === matchedTopicId);
    if (curated) {
      // Prioritize questions matching requested difficulty
      const exactDiffQs = curated.questions.filter(q => q.difficulty === targetDiff);
      const otherDiffQs = curated.questions.filter(q => q.difficulty !== targetDiff);

      // Build question selection: matching difficulty first, then fallback
      let selectedQuestions = [...exactDiffQs];
      if (selectedQuestions.length < count) {
        selectedQuestions.push(...otherDiffQs.slice(0, count - selectedQuestions.length));
      }
      selectedQuestions = selectedQuestions.slice(0, count);

      // Ensure question objects carry the requested difficulty metadata
      const questionsWithDiff = selectedQuestions.map((q, idx) => ({
        ...q,
        difficulty: targetDiff
      }));

      return {
        topic: cleanTitle,
        topicId: curated.id,
        difficulty: targetDiff,
        engineUsed: 'curated-diagnostic-bank',
        isAiGenerated: false,
        engineNotice: `Curated Expert Diagnostic Bank loaded for "${cleanTitle}" (${targetDiff.toUpperCase()} difficulty).`,
        concepts: curated.concepts,
        questions: questionsWithDiff
      };
    }
  }

  // 2. Dynamic Domain-Specific Synthesis for Any Novel Topic
  return synthesizeDomainQuiz(cleanTitle, targetDiff, count);
}

/**
 * Domain-Specific Cognitive Question Synthesizer
 * Synthesizes 3 genuinely relevant questions tailored to the requested topic and difficulty
 */
function synthesizeDomainQuiz(titleClean, targetDifficulty, count = 3) {
  const slug = titleClean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalized = titleClean.toLowerCase();

  // Detect domain
  let domainKey = 'general';
  if (/react|vue|angular|svelte|dom|css|html|frontend|ui|tailwind|redux|component/i.test(normalized)) {
    domainKey = 'frontend';
  } else if (/sql|postgres|mysql|mongo|database|query|index|acid|transaction|table|nosql|redis|orm/i.test(normalized)) {
    domainKey = 'database';
  } else if (/docker|kubernetes|k8s|container|cloud|aws|devops|terraform|pod|ci\/cd|deploy|linux|bash|cluster/i.test(normalized)) {
    domainKey = 'devops';
  } else if (/python|django|fastapi|flask|numpy|pandas|pydantic/i.test(normalized)) {
    domainKey = 'python';
  } else if (/javascript|typescript|node|npm|express|v8|prototype|promise|async/i.test(normalized)) {
    domainKey = 'javascript';
  } else if (/algorithm|dsa|tree|graph|sort|search|binary|dp|dynamic programming|big-o|complexity|hash/i.test(normalized)) {
    domainKey = 'algorithms';
  } else if (/api|rest|graphql|grpc|microservices|auth|jwt|oauth|cache|kafka|pubsub|gateway/i.test(normalized)) {
    domainKey = 'systems';
  }

  // Build 3 concepts for the DAG
  const concepts = [
    { id: `${slug}-foundations`, name: `${titleClean}: Core Invariants & State Rules`, prereq: null },
    { id: `${slug}-lifecycle`, name: `${titleClean}: Lifecycle Timing & Edge Cases`, prereq: `${slug}-foundations` },
    { id: `${slug}-optimization`, name: `${titleClean}: Scale, Trade-offs & Failure Modes`, prereq: `${slug}-lifecycle` }
  ];

  // Domain-specific question generators
  const DOMAIN_SPECS = {
    frontend: {
      foundational: [
        {
          q: `In frontend architecture with ${titleClean}, how is state synchronization guaranteed across rendering passes?`,
          code: `// State synchronization in ${titleClean}\nconst [state, setState] = useFeature("${titleClean}");\nfunction handleTrigger() {\n  setState(prev => update(prev));\n}`,
          correct: `State transitions are queued asynchronously and applied deterministically on subsequent reconciliation frames.`,
          distractorA: `State variables mutate immediately in synchronous execution order bypassing component re-renders.`,
          distractorB: `State changes write directly to browser localStorage before updating Virtual DOM nodes.`,
          distractorC: `State updates force an immediate browser page reload to reset DOM memory.`,
          miscLabel: `Synchronous In-Place State Mutation Fallacy`,
          miscExpl: `You assumed state updates in ${titleClean} apply synchronously in-place. Modern reactive UI runtimes schedule state changes asynchronously to batch render updates.`
        },
        {
          q: `When rendering lists or dynamic collections in ${titleClean}, what is the mandatory invariant for element identifiers?`,
          code: `// Rendering dynamic elements for ${titleClean}\ncollection.map(item => <View key={item.id} data={item} />);`,
          correct: `Keys must be stable, unique, and persistent across renders so the reconciler correctly preserves component identity.`,
          distractorA: `Using Math.random() as the key is best practice to force fresh rendering every cycle.`,
          distractorB: `Keys are purely visual attributes that have zero impact on virtual tree diffing.`,
          distractorC: `Array index should always be used even if items are reordered or filtered.`,
          miscLabel: `Volatile Key Identifiers Misconception`,
          miscExpl: `Using unstable keys (like Math.random() or unstable array indexes during reordering) destroys DOM state and triggers catastrophic component recreation.`
        },
        {
          q: `What is the primary risk of omitting cleanup handlers when binding global window events in ${titleClean}?`,
          code: `// Event subscription in ${titleClean}\nuseEffect(() => {\n  window.addEventListener("resize", handleResize);\n  // Missing return cleanup function!\n}, []);`,
          correct: `Memory leaks and ghost event callbacks firing against unmounted component instances.`,
          distractorA: `The browser immediately terminates all active web socket connections.`,
          distractorB: `It raises an uncatchable SyntaxError in modern browser engines.`,
          distractorC: `Window events automatically unregister themselves when garbage collection runs.`,
          miscLabel: `Automatic Garbage Collection Assumption`,
          miscExpl: `Event listeners held by global objects (window, document) prevent garbage collection, leaking memory until the tab is closed.`
        }
      ],
      intermediate: [
        {
          q: `When optimizing component re-rendering in ${titleClean}, what causes unexpected re-renders despite memoization?`,
          code: `// Memoized component in ${titleClean}\nconst MemoizedView = React.memo(View);\n// Parent render:\n<MemoizedView options={{ theme: "dark" }} onSelect={() => handleSelect()} />`,
          correct: `Inline object literals and inline arrow functions create new memory references on every render, failing shallow equality checks.`,
          distractorA: `React.memo only works on class components, not functional components.`,
          distractorB: `The browser prohibits passing functions as component props.`,
          distractorC: `State changes in sibling components unconditionally bust all memo caches.`,
          miscLabel: `Reference Equality Blindspot`,
          miscExpl: `You overlooked that inline objects \`{ theme: "dark" }\` and inline arrow functions create new object references every render, causing shallow equality \`prevProps === nextProps\` to return false.`
        },
        {
          q: `In ${titleClean}, how should asynchronous race conditions be handled when an input parameter changes rapidly?`,
          code: `// Data fetching in ${titleClean}\nuseEffect(() => {\n  let active = true;\n  fetchData(id).then(data => {\n    if (active) setState(data);\n  });\n  return () => { active = false; };\n}, [id]);`,
          correct: `Using a boolean cancellation flag or AbortController in the cleanup function ensures outdated async responses are discarded.`,
          distractorA: `Asynchronous promises automatically cancel when new promises are instantiated.`,
          distractorB: `Setting setTimeout(..., 1000) prevents race conditions completely.`,
          distractorC: `The browser network layer serializes all HTTP requests into a single synchronous thread.`,
          miscLabel: `Automatic Promise Cancellation Myth`,
          miscExpl: `Promises in JavaScript cannot be cancelled once started. Without an explicit cancellation flag or AbortController, a slow previous request can overwrite newer data.`
        },
        {
          q: `What is the architectural trade-off when lifting state up to a common ancestor in ${titleClean}?`,
          code: `// Architectural state management in ${titleClean}\nfunction App() {\n  const [globalState, setGlobalState] = useState(initial);\n  return <Dashboard state={globalState} />;\n}`,
          correct: `It ensures a single source of truth across siblings, but causes all child components subscribed to that scope to re-render on changes.`,
          distractorA: `Lifting state reduces memory consumption to zero across all components.`,
          distractorB: `Child components can no longer receive props once state is lifted.`,
          distractorC: `Lifting state is deprecated in favor of global window variables.`,
          miscLabel: `Global State Panacea Fallacy`,
          miscExpl: `While lifting state resolves synchronization issues, excessive state lifting causes widespread re-rendering across unrelated subtrees.`
        }
      ],
      advanced: [
        {
          q: `In concurrent rendering architectures implementing ${titleClean}, why must render functions remain pure and idempotent?`,
          code: `// Pure rendering invariant in ${titleClean}\nfunction Component({ data }) {\n  // Side effect inside render body!\n  analytics.log("Rendering component");\n  return <div>{data.title}</div>;\n}`,
          correct: `Concurrent mode may start, pause, abort, and restart rendering multiple times before committing to the screen, multiplying side effects.`,
          distractorA: `Render functions run inside WebAssembly where side-effects crash the sandbox.`,
          distractorB: `Impure renders corrupt the JavaScript call stack permanently.`,
          distractorC: `Modern engines require all HTML tags to be pre-compiled into binary bytecode.`,
          miscLabel: `Synchronous Single-Pass Render Assumption`,
          miscExpl: `In concurrent React, rendering is interruptible. Side effects placed in the render body (instead of useEffect) execute unpredictably multiple times.`
        },
        {
          q: `When designing micro-frontends or modular systems with ${titleClean}, how is styles and runtime isolation enforced?`,
          code: `// CSS and Module encapsulation for ${titleClean}\nconst shadowRoot = hostElement.attachShadow({ mode: "open" });\nshadowRoot.appendChild(componentNode);`,
          correct: `Using Shadow DOM boundaries or scoped CSS modules prevents style leakage and global namespace collisions.`,
          distractorA: `All micro-frontends must share the exact same global Redux store.`,
          distractorB: `Styles automatically isolate based on variable naming length.`,
          distractorC: `CSS rules are scoped by operating system process permissions.`,
          miscLabel: `CSS Global Namespace Leakage Blindspot`,
          miscExpl: `Without Shadow DOM or scoped tooling, CSS class selectors easily bleed across module boundaries in micro-frontends.`
        },
        {
          q: `What is the performance implication of virtualization when displaying 100,000 items in ${titleClean}?`,
          code: `// Virtualized windowing in ${titleClean}\n<VirtualList itemCount={100000} itemSize={50} renderItem={Row} />`,
          correct: `Only DOM nodes visible within the current viewport are rendered and kept in memory, keeping memory footprint constant $O(1)$.`,
          distractorA: `Virtualization pre-renders all 100,000 DOM elements into off-screen canvas buffers.`,
          distractorB: `Virtualization compresses the text into zip archives inside RAM.`,
          distractorC: `Virtualization divides the screen resolution by 100,000.`,
          miscLabel: `Off-Screen DOM Bloat Fallacy`,
          miscExpl: `Rendering 100,000 actual DOM nodes will freeze the browser. Virtualization only renders the ~20 items currently visible on the screen.`
        }
      ]
    },
    database: {
      foundational: [
        {
          q: `In database systems working with ${titleClean}, what is the primary role of an index on a queried column?`,
          code: `-- Index evaluation in ${titleClean}\nCREATE INDEX idx_target ON records(target_field);\nSELECT * FROM records WHERE target_field = 'alpha';`,
          correct: `It enables logarithmic $O(\\log N)$ search lookups, avoiding costly full table scans $O(N)$.`,
          distractorA: `It encrypts the column data so unauthorized users cannot read it.`,
          distractorB: `It automatically deletes duplicate records from the table.`,
          distractorC: `It forces all queries to run in parallel background threads.`,
          miscLabel: `Index as Security Feature Misconception`,
          miscExpl: `An index is a performance data structure (typically a B-Tree), not an encryption or access control mechanism.`
        },
        {
          q: `What does the "A" in ACID transactions represent when executing modifications in ${titleClean}?`,
          code: `-- Atomic transaction in ${titleClean}\nBEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`,
          correct: `Atomicity: all operations succeed together, or the entire transaction rolls back completely with zero partial state changes.`,
          distractorA: `Asynchrony: transactions execute in the background whenever the CPU is idle.`,
          distractorB: `Availability: the database guarantees 100% uptime without failure.`,
          distractorC: `Authorization: only root administrative users can modify the tables.`,
          miscLabel: `ACID Terminology Conflation`,
          miscExpl: `Atomicity ensures "all or nothing" execution: if step 2 fails, step 1 is rolled back completely.`
        },
        {
          q: `In relational databases, what happens when a query joins two tables without specifying an ON condition?`,
          code: `-- Unconditioned join in ${titleClean}\nSELECT * FROM table_a, table_b;`,
          correct: `A Cartesian product (CROSS JOIN) pairing every row of table A with every row of table B ($M \\times N$).`,
          distractorA: `The database automatically guesses matching primary and foreign keys.`,
          distractorB: `The query returns 0 rows because conditions are mandatory.`,
          distractorC: `The database crashes with a fatal kernel panic.`,
          miscLabel: `Implicit Join Matching Myth`,
          miscExpl: `SQL never guesses join keys. Without an ON condition, it generates a full Cartesian product, returning $M \\times N$ rows.`
        }
      ],
      intermediate: [
        {
          q: `When querying ${titleClean}, why does wrapping an indexed column in a function (e.g., \`WHERE LOWER(email) = '...' \`) bypass the index?`,
          code: `-- Function on indexed column in ${titleClean}\nCREATE INDEX idx_email ON users(email);\nSELECT * FROM users WHERE LOWER(email) = 'user@example.com';`,
          correct: `The B-Tree index stores raw \`email\` values; evaluating \`LOWER()\` requires computing the function on every row, forcing a full table scan.`,
          distractorA: `SQL databases forbid string functions in WHERE clauses.`,
          distractorB: `The LOWER function renames the column in the database schema.`,
          distractorC: `Indexes only support integer comparison, never string characters.`,
          miscLabel: `Expression Indexing Blindspot`,
          miscExpl: `Standard indexes store raw values. Applying functions on columns in WHERE clauses prevents B-Tree index lookups unless an explicit functional index \`CREATE INDEX ON users(LOWER(email))\` exists.`
        },
        {
          q: `In ${titleClean}, what is the difference between \`READ COMMITTED\` and \`REPEATABLE READ\` isolation levels?`,
          code: `-- Transaction isolation in ${titleClean}\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 1;`,
          correct: `REPEATABLE READ guarantees that if you re-read the same row within the transaction, you always see the exact same snapshot value.`,
          distractorA: `READ COMMITTED prevents other users from reading data while you query it.`,
          distractorB: `REPEATABLE READ saves query results permanently into hard drive text files.`,
          distractorC: `READ COMMITTED runs queries 100x faster by disabling write-ahead logging.`,
          miscLabel: `Transaction Isolation Level Conflation`,
          miscExpl: `In READ COMMITTED, another committed transaction can change data between your reads (non-repeatable read). REPEATABLE READ prevents this by maintaining a consistent snapshot.`
        },
        {
          q: `What is the cause and resolution of an N+1 query problem when loading related records in ${titleClean}?`,
          code: `-- ORM N+1 query pattern in ${titleClean}\nusers = getUsers(); // 1 query\nfor u in users: getOrders(u.id); // N queries!`,
          correct: `Executing a separate query for each child record; resolved by eager loading (JOIN or \`WHERE id IN (...)\`) in a single query.`,
          distractorA: `Using primary keys with odd numbers instead of even numbers.`,
          distractorB: `Running the database inside a Docker container.`,
          distractorC: `Naming foreign keys with fewer than 4 characters.`,
          miscLabel: `ORM Query Multiplier Blindspot`,
          miscExpl: `N+1 queries flood the database with hundreds of round-trips. Eager loading combines lookups into a single efficient query.`
        }
      ],
      advanced: [
        {
          q: `Under high write concurrency in ${titleClean}, how does Optimistic Concurrency Control (OCC) prevent lost updates?`,
          code: `-- Optimistic locking in ${titleClean}\nUPDATE inventory\nSET quantity = quantity - 1, version = version + 1\nWHERE id = 42 AND version = 5;`,
          correct: `It verifies that the record's version/timestamp has not changed since it was read; if 0 rows are updated, a collision occurred and the transaction retries.`,
          distractorA: `It holds an exclusive row-level lock on the table for 10 minutes.`,
          distractorB: `It rejects all write requests from users who do not have admin credentials.`,
          distractorC: `It saves the update to browser cookies and syncs overnight.`,
          miscLabel: `Pessimistic vs Optimistic Locking Confusion`,
          miscExpl: `Optimistic locking avoids expensive lock contention by checking a version number at commit time and retrying if another concurrent transaction updated it first.`
        },
        {
          q: `When partitioning or sharding data across nodes for ${titleClean}, what is the danger of choosing a low-cardinality shard key?`,
          code: `-- Sharding configuration for ${titleClean}\nSHARD COLLECTION customers BY KEY (status); -- e.g. 'active', 'inactive'`,
          correct: `It creates severe data and write hotspots on a few nodes, negating horizontal scaling and bottlenecking the cluster.`,
          distractorA: `Low cardinality keys increase disk storage requirements exponentially.`,
          distractorB: `Low cardinality causes network cables to overheat.`,
          distractorC: `Databases only allow GUIDs as shard keys.`,
          miscLabel: `Shard Key Skew Blindspot`,
          miscExpl: `A shard key with few unique values (e.g. status) routes all traffic to only 1 or 2 nodes (hotspotting), leaving other nodes idle.`
        },
        {
          q: `In distributed databases implementing ${titleClean}, how does the CAP theorem restrict system guarantees during a network partition?`,
          code: `-- Distributed consistency evaluation for ${titleClean}\n-- Node A is partitioned from Node B across network boundary`,
          correct: `You must choose between returning fresh consistent data (Consistency) or remaining available to accept writes (Availability); you cannot guarantee both.`,
          distractorA: `Network partitions can be eliminated by upgrading server RAM.`,
          distractorB: `Distributed databases guarantee Consistency, Availability, and Partition Tolerance simultaneously 100% of the time.`,
          distractorC: `The CAP theorem only applies to relational databases, never NoSQL databases.`,
          miscLabel: `CAP Theorem Myth`,
          miscExpl: `During a network partition (P), you MUST sacrifice either immediate consistency (C) or availability (A). No distributed system can achieve both during partitions.`
        }
      ]
    },
    devops: {
      foundational: [
        {
          q: `In container and cloud workflows for ${titleClean}, what is the purpose of isolating application processes inside containers?`,
          code: `# Container isolation in ${titleClean}\ndocker run -d --name service_worker ${slug}-image`,
          correct: `It bundles runtime dependencies, system libraries, and code together, guaranteeing consistent execution across environments.`,
          distractorA: `It replaces the need for an underlying operating system kernel entirely.`,
          distractorB: `It increases CPU clock speed by 50%.`,
          distractorC: `It converts source code into pure hardware firmware.`,
          miscLabel: `Container as Virtual Machine Fallacy`,
          miscExpl: `Containers do not virtualize hardware or run their own kernel; they share the host kernel while isolating process namespaces and filesystems.`
        },
        {
          q: `When building container images for ${titleClean}, what is the benefit of Docker layer caching?`,
          code: `# Dockerfile layer order for ${titleClean}\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD ["npm", "start"]`,
          correct: `Unchanged layers (like installed dependencies) are reused from cache, speeding up build pipelines significantly.`,
          distractorA: `It encrypts the source code inside military-grade vaults.`,
          distractorB: `It eliminates all network bandwidth usage permanently.`,
          distractorC: `It forces all code changes to be committed to Git automatically.`,
          miscLabel: `Layer Cache Rebuild Blindspot`,
          miscExpl: `Placing slowly-changing instructions (COPY package.json; RUN npm install) before frequently-changing source code maximizes layer cache hits.`
        },
        {
          q: `In cloud infrastructure for ${titleClean}, what does a Health Check (liveness probe) do?`,
          code: `# Health check probe in ${titleClean}\nHEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8080/health || exit 1`,
          correct: `It periodically tests if the container process is responsive, triggering automated restarts if it becomes unresponsive or deadlocked.`,
          distractorA: `It checks the physical temperature of the server CPU.`,
          distractorB: `It counts the number of lines of code in the repository.`,
          distractorC: `It sends notification emails to end users whenever they log in.`,
          miscLabel: `Health Check Purpose Conflation`,
          miscExpl: `Liveness probes detect deadlocked processes that are still running in the process table but cannot serve requests, restarting them automatically.`
        }
      ],
      intermediate: [
        {
          q: `In orchestration environments (like Kubernetes) managing ${titleClean}, what is the fundamental difference between a Pod and a Container?`,
          code: `# Pod definition in ${titleClean}\napiVersion: v1\nkind: Pod\nmetadata: { name: "${slug}-pod" }\nspec:\n  containers:\n  - name: app\n    image: ${slug}:v1`,
          correct: `A Pod is the smallest deployable scheduling unit, which can encapsulate one or more tightly-coupled containers sharing the same network IP and storage volumes.`,
          distractorA: `A Pod is a physical server motherboard installed in a datacenter rack.`,
          distractorB: `Containers can contain pods, but pods cannot contain containers.`,
          distractorC: `Pods are only supported on Linux kernel 2.4.`,
          miscLabel: `Pod vs Container Hierarchy Inversion`,
          miscExpl: `In Kubernetes, Pods wrap containers. Containers in the same Pod share the same network namespace (localhost) and can share volumes.`
        },
        {
          q: `When managing secrets and configurations in ${titleClean}, why should credentials NEVER be baked into container images?`,
          code: `# Anti-pattern in ${titleClean}\nENV DATABASE_PASSWORD="super-secret-password"\n# Baked into image layers!`,
          correct: `Image layers are cached and inspectable via \`docker history\`, exposing credentials to anyone with read access to the image registry.`,
          distractorA: `Passwords in container images cause the Docker daemon to crash on boot.`,
          distractorB: `Environment variables can only store integer numbers, not strings.`,
          distractorC: `Container registries automatically delete images that contain passwords.`,
          miscLabel: `Baked Secrets Security Anti-Pattern`,
          miscExpl: `Any string written into a Dockerfile layer persists in the image history forever, even if deleted in a later layer. Use environment injection or secrets mounts.`
        },
        {
          q: `In microservice architectures implementing ${titleClean}, what problem does a Circuit Breaker pattern solve?`,
          code: `# Circuit breaker in ${titleClean}\nif (circuitBreaker.isOpen()) {\n  return getFallbackData();\n}`,
          correct: `It prevents cascading failures by failing fast and avoiding repeated calls to an already unresponsive downstream dependency.`,
          distractorA: `It cuts off electricity to the server rack during high power bills.`,
          distractorB: `It encrypts outbound HTTP payloads with SHA-256.`,
          distractorC: `It converts microservices into monolithic desktop applications.`,
          miscLabel: `Cascading Failure Blindspot`,
          miscExpl: `Without a circuit breaker, threads exhaust threadpools waiting for timeouts from a failing service, bringing down the entire upstream system.`
        }
      ],
      advanced: [
        {
          q: `In high-availability cloud deployments of ${titleClean}, how does a Rolling Update achieve zero-downtime deployment?`,
          code: `# Rolling update strategy in ${titleClean}\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0`,
          correct: `It spins up new version instances, verifies readiness probes succeed, and routes traffic before gracefully terminating old version instances.`,
          distractorA: `It shuts down all running instances simultaneously for 5 minutes during maintenance.`,
          distractorB: `It updates code directly on live disk memory without restarting any processes.`,
          distractorC: `It forces all active users to clear their browser cache before reconnecting.`,
          miscLabel: `Cold Restart Conflation`,
          miscExpl: `Rolling updates incrementally replace old pods with new pods, ensuring at least 100% capacity is maintained throughout deployment.`
        },
        {
          q: `What is the cause and remediation of a CrashLoopBackOff state when deploying ${titleClean}?`,
          code: `# Pod status error in ${titleClean}\nNAME                    READY   STATUS             RESTARTS   AGE\n${slug}-worker-6b5d9   0/1     CrashLoopBackOff   5          3m`,
          correct: `The application process exits with non-zero exit code immediately upon startup (e.g. missing environment variables or failed DB connection); inspect via \`kubectl logs\`.`,
          distractorA: `The cluster has run out of physical hard drive space worldwide.`,
          distractorB: `The developer's SSH key expired on their local laptop.`,
          distractorC: `Kubernetes automatically deletes pods after 3 minutes of uptime.`,
          miscLabel: `CrashLoop Diagnosis Blindspot`,
          miscExpl: `CrashLoopBackOff means the container started and crashed repeatedly. Checking container logs reveals the unhandled startup exception (missing config, connection failure).`
        },
        {
          q: `When scaling ${titleClean} horizontally across regions, how does Infrastructure as Code (IaC) prevent configuration drift?`,
          code: `# Terraform / Declarative IaC for ${titleClean}\nresource "aws_eks_cluster" "${slug}_cluster" {\n  name     = "${slug}-prod"\n  role_arn = aws_iam_role.cluster.arn\n}`,
          correct: `It maintains the desired infrastructure state in version-controlled declarative code, detecting and reconciling manual discrepancies automatically.`,
          distractorA: `It eliminates all cloud hosting costs by running on blockchain nodes.`,
          distractorB: `It converts shell scripts into Microsoft Excel spreadsheets.`,
          distractorC: `It replaces the need for unit testing and code reviews.`,
          miscLabel: `Declarative State Invariance`,
          miscExpl: `Declarative IaC (Terraform, Pulumi) ensures environments are identical, reproducible, and self-healing against manual server configuration drift.`
        }
      ]
    },
    general: {
      foundational: [
        {
          q: `What is the fundamental architectural principle governing state and boundary contracts in ${titleClean}?`,
          code: `// Examining baseline invariants in ${titleClean}\nconst instance = initialize("${titleClean}", { mode: "strict" });\ninstance.execute();`,
          correct: `It guarantees deterministic behavior by strictly enforcing input validation and isolating lifecycle boundaries.`,
          distractorA: `It bypasses underlying runtime protections to achieve raw memory throughput unconditionally.`,
          distractorB: `It delegates all synchronization directly to client-side hardware interrupts.`,
          distractorC: `It treats every operation as a non-reentrant global singleton.`,
          miscLabel: `Unchecked Optimization Fallacy`,
          miscExpl: `In ${titleClean}, software reliability and structural safety take strict precedence over raw unchecked throughput.`
        },
        {
          q: `When debugging an unexpected failure in ${titleClean}, what is the first principle to verify?`,
          code: `// Debugging validation in ${titleClean}\nassert(instance.isHealthy(), "Invariant violation detected in ${titleClean}");`,
          correct: `Verify the input preconditions, error boundary guards, and lifecycle assumptions.`,
          distractorA: `Immediately reboot the host operating system without checking logs.`,
          distractorB: `Disable all linter warnings and compiler type-checking.`,
          distractorC: `Increase timeout thresholds to infinity to mask slow responses.`,
          miscLabel: `Symptom Masking vs Root Cause Isolation`,
          miscExpl: `Masking errors by disabling checks or increasing timeouts leads to silent corruption. Always isolate root preconditions.`
        },
        {
          q: `In ${titleClean}, why is immutability and idempotent execution favored in concurrent workflows?`,
          code: `// Idempotent execution in ${titleClean}\nconst result = processOperation(input); // Does not mutate input!`,
          correct: `Immutable data eliminates data races and side effects, ensuring operations can be repeated safely without corrupting shared state.`,
          distractorA: `Immutability causes the computer to execute operations in reverse chronological order.`,
          distractorB: `Mutable variables are forbidden by the CPU architecture.`,
          distractorC: `Idempotency forces all functions to return null.`,
          miscLabel: `Concurrency Side-Effect Blindspot`,
          miscExpl: `Shared mutable state is the root cause of race conditions. Immutable data structures allow safe concurrent access without locks.`
        }
      ],
      intermediate: [
        {
          q: `What is the most common anti-pattern or resource leak when deploying ${titleClean}?`,
          code: `// Resource lifecycle investigation in ${titleClean}\nconst connection = openResource("${titleClean}");\n// Missing close or disposal handler!`,
          correct: `Failing to release unmanaged resources or unregister event listeners, causing gradual memory leaks and thread exhaustion.`,
          distractorA: `Declaring variable identifiers with more than 8 characters.`,
          distractorB: `Using JSON data serialization instead of raw binary hex streams.`,
          distractorC: `Running the execution unit inside a standard Linux container environment.`,
          miscLabel: `Unmanaged Resource Retention Anti-Pattern`,
          miscExpl: `Every allocated handle, network stream, or event listener must be closed in a guaranteed teardown/finally block.`
        },
        {
          q: `In systems implementing ${titleClean}, how should asynchronous failures be handled gracefully?`,
          code: `// Error handling pattern in ${titleClean}\ntry {\n  await executeOperation("${titleClean}");\n} catch (err) {\n  logger.error("Failed", { err });\n  throw new DomainError("Operation failed", { cause: err });\n}`,
          correct: `By catching specific exceptions, logging contextual diagnostics, and rethrowing structured domain errors rather than swallowing errors silently.`,
          distractorA: `By wrapping the entire codebase in an empty catch-all block that does nothing.`,
          distractorB: `By exiting the application process with exit code 0 whenever an error occurs.`,
          distractorC: `By ignoring all errors and continuing execution with uninitialized variables.`,
          miscLabel: `Silent Error Swallowing Anti-Pattern`,
          miscExpl: `Swallowing errors with empty catch blocks creates ghost bugs that are impossible to diagnose in production. Always log or wrap errors.`
        },
        {
          q: `When scaling systems that utilize ${titleClean}, which architectural trade-off must be prioritized?`,
          code: `// Scale characteristic evaluation for ${titleClean}\nconst metric = measurePerformance("${titleClean}");`,
          correct: `Balancing latency vs consistency: understanding whether the workflow requires immediate strong consistency or eventual synchronization.`,
          distractorA: `Always choosing 100% in-memory storage without persistent backup files.`,
          distractorB: `Replacing all asynchronous event flows with synchronous blocking polling loops.`,
          distractorC: `Hardcoding IP addresses and access tokens directly into source control.`,
          miscLabel: `Durability Neglect Misconception`,
          miscExpl: `System architecture is the science of trade-offs. Matching consistency, latency, and throughput requirements to real user needs is paramount.`
        }
      ],
      advanced: [
        {
          q: `When designing modular services implementing ${titleClean}, what is the primary indicator of proper loose coupling?`,
          code: `// Decoupled architecture evaluation for ${titleClean}\ninterface ServiceContract { execute(cmd: Command): Promise<Result>; }`,
          correct: `Modules communicate through strict public interfaces and contracts, allowing individual components to be updated, tested, and scaled independently without cascading breaks.`,
          distractorA: `All business logic is merged into a single 50,000-line monolithic source file.`,
          distractorB: `Every module directly accesses the private database tables of all other modules.`,
          distractorC: `The application only functions when all external third-party partner APIs are 100% online.`,
          miscLabel: `Tight Coupling & Blast Radius Blindspot`,
          miscExpl: `Tight coupling causes changes in one module to break unrelated services. Strict interface boundaries limit blast radius.`
        },
        {
          q: `In high-throughput implementations of ${titleClean}, how does backpressure prevent catastrophic system collapse?`,
          code: `// Backpressure flow control in ${titleClean}\nstream.on("data", chunk => {\n  if (!downstream.write(chunk)) stream.pause(); // Backpressure signaled!\n});`,
          correct: `It signals fast producers to slow down when consumers or buffers are overwhelmed, preventing Out-Of-Memory (OOM) crashes.`,
          distractorA: `It speeds up the consumer by skipping 50% of incoming data packets.`,
          distractorB: `It shuts down the physical server whenever network bandwidth exceeds 1 MB/s.`,
          distractorC: `It forces all messages to be printed to the terminal console.`,
          miscLabel: `Unbounded Buffer Overflow Myth`,
          miscExpl: `Without backpressure, fast producers fill in-memory buffers until the application runs out of memory and crashes.`
        },
        {
          q: `In distributed implementations of ${titleClean}, why is idempotency essential for reliable message processing?`,
          code: `-- Idempotent message consumption in ${titleClean}\nINSERT INTO processed_events (event_id, processed_at) VALUES ('evt_123', NOW())\nON CONFLICT (event_id) DO NOTHING;`,
          correct: `Because distributed networks guarantee "at-least-once" delivery, duplicate message deliveries will occur and must not cause duplicate side effects.`,
          distractorA: `Because network cables physically destroy 50% of all duplicate messages.`,
          distractorB: `Because message queues only support single-threaded sequential consumption.`,
          distractorC: `Because databases automatically reject all SQL queries that contain duplicates.`,
          miscLabel: `Exactly-Once Network Delivery Fallacy`,
          miscExpl: `Distributed networks cannot guarantee exactly-once delivery across network partitions. Consumers must be idempotent to prevent duplicate processing (e.g. charging a credit card twice).`
        }
      ]
    }
  };

  // Select domain spec or fallback to general
  const domainSpec = DOMAIN_SPECS[domainKey] || DOMAIN_SPECS.general;
  const rawQuestions = domainSpec[targetDifficulty] || domainSpec.intermediate;

  const generatedQuestions = rawQuestions.slice(0, count).map((item, idx) => {
    const qConcept = concepts[idx] || concepts[0];
    return {
      id: `${slug}-${targetDifficulty}-q${idx + 1}`,
      conceptId: qConcept.id,
      conceptName: qConcept.name,
      prereqId: qConcept.prereq,
      difficulty: targetDifficulty,
      question: item.q,
      code: item.code,
      options: [
        {
          id: 'A',
          text: item.correct,
          isCorrect: true,
          misconceptionId: null,
          misconceptionLabel: null,
          misconceptionExplanation: `Correct! ${item.correct}`
        },
        {
          id: 'B',
          text: item.distractorA,
          isCorrect: false,
          misconceptionId: `${slug}-misc-1`,
          misconceptionLabel: item.miscLabel,
          misconceptionExplanation: item.miscExpl
        },
        {
          id: 'C',
          text: item.distractorB,
          isCorrect: false,
          misconceptionId: `${slug}-misc-2`,
          misconceptionLabel: `Premature Assumption in ${titleClean}`,
          misconceptionExplanation: `You assumed: "${item.distractorB}". In ${titleClean}, architectural guarantees require explicit validation.`
        },
        {
          id: 'D',
          text: item.distractorC,
          isCorrect: false,
          misconceptionId: `${slug}-misc-3`,
          misconceptionLabel: `Lifecycle Boundary Conflation in ${titleClean}`,
          misconceptionExplanation: `You conflated operational boundaries with low-level execution details in ${titleClean}.`
        }
      ],
      remediation: {
        conceptExplanation: `In ${titleClean}, maintaining rigorous invariants around state transitions, execution context, and failure boundaries is essential.`,
        mentalModelFix: `Remember: Always trace where state lives and what triggers transitions in ${titleClean}. Never assume implicit side-effects or unchecked synchronization.`,
        followUpQuestion: {
          id: `${slug}-${targetDifficulty}-q${idx + 1}-followup`,
          question: `When validating the implementation of ${titleClean}, what is the primary verification principle?`,
          options: [
            { id: 'A', text: 'Verify that preconditions, error guards, and boundary contracts are explicitly tested.', isCorrect: true, explanation: 'Spot on! Defensive boundary testing isolates defects before they reach production.' },
            { id: 'B', text: 'Rely purely on manual user bug reports in production.', isCorrect: false, explanation: 'Production bug reports mean failures have already impacted end users.' },
            { id: 'C', text: 'Disable all error logging to improve execution speed.', isCorrect: false, explanation: 'Disabling error visibility makes diagnosing system defects impossible.' }
          ]
        }
      }
    };
  });

  return {
    topic: titleClean,
    topicId: slug,
    difficulty: targetDifficulty,
    category: `${domainKey.toUpperCase()} Engineering`,
    engineUsed: 'topic-aware-fallback',
    isAiGenerated: false,
    engineNotice: `Topic-Aware Diagnostic Engine. Specialized questions synthesized for "${titleClean}" (${targetDifficulty.toUpperCase()} difficulty).`,
    concepts,
    questions: generatedQuestions
  };
}

export const getFallbackTopicById = (topicId) => {
  return FALLBACK_TOPICS.find(t => t.id === topicId) || FALLBACK_TOPICS[0];
};
