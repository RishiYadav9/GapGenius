// Curated High-Yield Diagnostic Question Banks with Deep Misconception Tagging
// Used when Gemini API is offline or for rapid offline judge demonstration

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
        question: 'What is printed after calling `add_item("apple")` twice in a row?',
        code: `def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item("apple"))\nprint(add_item("banana"))`,
        options: [
          {
            id: 'A',
            text: '["apple"] followed by ["banana"]',
            isCorrect: false,
            misconceptionId: 'invocation-time-evaluation',
            misconceptionLabel: 'Per-Invocation Default Parameter Misconception',
            misconceptionExplanation: 'You assumed default arguments are created fresh each time the function executes. In Python, default parameter expressions are evaluated ONCE at function definition time, persisting across all subsequent calls!'
          },
          {
            id: 'B',
            text: '["apple"] followed by ["apple", "banana"]',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The default list `basket` is initialized once at function definition time and mutated on each call.'
          },
          {
            id: 'C',
            text: '["apple", "banana"] followed by ["apple", "banana"]',
            isCorrect: false,
            misconceptionId: 'static-state-confusion',
            misconceptionLabel: 'Static State Confusion',
            misconceptionExplanation: 'The first call executes before the second call, so the first output only contains "apple".'
          },
          {
            id: 'D',
            text: 'TypeError: mutable default argument not permitted',
            isCorrect: false,
            misconceptionId: 'linter-vs-runtime',
            misconceptionLabel: 'Linter Warning vs Language Semantics Confusion',
            misconceptionExplanation: 'While linters (like flake8 or pylint) warn against mutable defaults, Python runtime allows them.'
          }
        ],
        remediation: {
          conceptExplanation: 'Function definitions in Python are executable statements. Default values are bound to the function object when the `def` block runs, not when called.',
          mentalModelFix: 'Always use `basket=None` and initialize `if basket is None: basket = []` inside the function body if you desire a fresh list per call.',
          followUpQuestion: {
            id: 'py-q2-followup',
            question: 'How do you idiomatically prevent shared mutable state in Python default parameters?',
            options: [
              { id: 'A', text: 'Set default to `None` and assign `basket = []` inside `if basket is None:`', isCorrect: true, explanation: 'Spot on! This guarantees a brand new list is allocated inside the caller execution scope each time.' },
              { id: 'B', text: 'Use a tuple default instead of list: `basket=()`', isCorrect: false, explanation: 'Tuples are immutable, so calling `.append()` would raise an AttributeError.' },
              { id: 'C', text: 'Add `global basket` at the beginning of the function', isCorrect: false, explanation: 'Making it global exacerbates state pollution rather than solving it.' }
            ]
          }
        }
      },
      {
        id: 'py-q3',
        conceptId: 'shallow-copy',
        conceptName: 'Shallow vs Deep Copy References',
        prereqId: 'var-binding',
        difficulty: 'advanced',
        question: 'What is the value of `original[0][0]` after this sequence?',
        code: `original = [[1, 2], [3, 4]]\ncopy_list = original.copy()\ncopy_list[0][0] = 99`,
        options: [
          {
            id: 'A',
            text: '1',
            isCorrect: false,
            misconceptionId: 'shallow-deep-equivalence',
            misconceptionLabel: 'Shallow Copy Clones Nested Objects Misconception',
            misconceptionExplanation: 'You assumed `.copy()` duplicates nested sublists. In Python, `.copy()` or `list[:]` is a SHALLOW copy; it creates a new outer container, but child elements are still shared pointers to the exact same nested sublists!'
          },
          {
            id: 'B',
            text: '99',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `.copy()` only duplicates the outer container. The inner sublists remain referenced by both containers.'
          },
          {
            id: 'C',
            text: 'IndexError: index out of bounds',
            isCorrect: false,
            misconceptionId: 'indexing-confusion',
            misconceptionLabel: 'Matrix 2D Indexing Misunderstanding',
            misconceptionExplanation: '`original[0][0]` is valid access to row 0, column 0.'
          },
          {
            id: 'D',
            text: 'None',
            isCorrect: false,
            misconceptionId: 'value-access-confusion',
            misconceptionLabel: 'Assignment Return Misconception',
            misconceptionExplanation: 'Assignment modifies the value in place; inspecting the index yields the updated integer.'
          }
        ],
        remediation: {
          conceptExplanation: 'Shallow copies clone only the container itself, inserting references to the items in the original. Deep copies recursively construct new copies of nested objects.',
          mentalModelFix: 'Think of shallow copy as photocopying a phone directory: you get a new paper booklet, but the phone numbers inside still call the exact same people. Use `copy.deepcopy()` for independent nested structures.',
          followUpQuestion: {
            id: 'py-q3-followup',
            question: 'Which module and function must be imported to create an independent clone of nested Python structures?',
            options: [
              { id: 'A', text: '`import copy; copy.deepcopy(obj)`', isCorrect: true, explanation: 'Spot on! `deepcopy` recursively traverses and clones every child object.' },
              { id: 'B', text: '`import sys; sys.clone(obj)`', isCorrect: false, explanation: '`sys.clone` does not exist in Python standard library.' },
              { id: 'C', text: '`list.clone(obj)`', isCorrect: false, explanation: 'Python lists have `.copy()`, not `.clone()`.' }
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
        conceptId: 'macrotask-timer',
        conceptName: 'Macrotask Queue (setTimeout & setImmediate)',
        prereqId: 'microtask-queue',
        difficulty: 'intermediate',
        question: 'What is printed by this classic `for` loop with `var`?',
        code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 10);\n}`,
        options: [
          {
            id: 'A',
            text: '0, 1, 2',
            isCorrect: false,
            misconceptionId: 'var-block-scope-assumption',
            misconceptionLabel: '`var` Has Block Scope Misconception',
            misconceptionExplanation: 'You assumed `var` creates a separate binding per loop iteration like `let`. Because `var` is function-scoped (or global), all closures capture the exact same variable `i`, which evaluates to `3` by the time the timer triggers!'
          },
          {
            id: 'B',
            text: '3, 3, 3',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `var` is function-scoped. The loop terminates when `i === 3`, after which all 3 callbacks read the single shared `i` variable.'
          },
          {
            id: 'C',
            text: 'Undefined, Undefined, Undefined',
            isCorrect: false,
            misconceptionId: 'closure-garbage-collection',
            misconceptionLabel: 'Variable Premature Garbage Collection Fallacy',
            misconceptionExplanation: 'Closures keep references alive; the variable is not garbage collected.'
          },
          {
            id: 'D',
            text: '0, 0, 0',
            isCorrect: false,
            misconceptionId: 'closure-snapshot-fallacy',
            misconceptionLabel: 'Closure Value-Snapshot Fallacy',
            misconceptionExplanation: 'Closures capture references to variables, not frozen value snapshots at definition time.'
          }
        ],
        remediation: {
          conceptExplanation: '`var` variables are hoisted to function scope. Changing `var i` to `let i` creates a new lexical scope binding for each loop iteration.',
          mentalModelFix: 'Replace `var` with `let`, or create an IIFE closure `((capturedIndex) => ...) (i)` to freeze each iteration value.',
          followUpQuestion: {
            id: 'js-q2-followup',
            question: 'What happens if you replace `var i = 0` with `let i = 0` in that loop?',
            options: [
              { id: 'A', text: 'It prints 0, 1, 2 because `let` creates a distinct binding per loop iteration', isCorrect: true, explanation: 'Right on! ES6 `let` is block-scoped per loop cycle.' },
              { id: 'B', text: 'It still prints 3, 3, 3', isCorrect: false, explanation: 'Incorrect. `let` fixes this scoping trap.' },
              { id: 'C', text: 'It throws a ReferenceError', isCorrect: false, explanation: 'Incorrect. `let` is standard syntax.' }
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
      { id: 'midpoint-overflow', name: 'Integer Arithmetic Midpoint Overflow', prereq: 'search-bounds' },
      { id: 'tree-recursion', name: 'Binary Tree Structural Invariant & Traversal', prereq: 'search-bounds' }
    ],
    questions: [
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
      }
    ]
  }
];

export const getFallbackTopicById = (topicId) => {
  return FALLBACK_TOPICS.find(t => t.id === topicId) || FALLBACK_TOPICS[0];
};
