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
            misconceptionExplanation: 'Correct! An empty dependency array `[]` signals that the effect does not synchronize with any props or state values, executing only on mount.'
          },
          {
            id: 'C',
            text: 'It never executes at all because dependencies are empty.',
            isCorrect: false,
            misconceptionId: 'dependency-precondition-fallacy',
            misconceptionLabel: 'Dependency Precondition Fallacy',
            misconceptionExplanation: 'Dependencies are conditions for re-execution, not preconditions for the initial mount run.'
          },
          {
            id: 'D',
            text: 'It runs synchronously before the DOM paints on the screen.',
            isCorrect: false,
            misconceptionId: 'layout-effect-confusion',
            misconceptionLabel: '`useLayoutEffect` vs `useEffect` Confusion',
            misconceptionExplanation: '`useEffect` is deferred and runs asynchronously after the browser paints. `useLayoutEffect` runs synchronously before paint.'
          }
        ],
        remediation: {
          conceptExplanation: '`useEffect` synchronizes component state with external systems. The dependency array tells React when to re-synchronize by shallow-comparing each element across renders.',
          mentalModelFix: 'Think of the dependency array as a change-detector checklist: `[]` means "nothing on this list can ever change", so React only runs it on initial arrival (mount).',
          followUpQuestion: {
            id: 'react-q1-followup',
            question: 'What happens if you omit the dependency array argument completely from `useEffect(fn)`?',
            options: [
              { id: 'A', text: 'The effect runs after every single render and re-render cycle.', isCorrect: true, explanation: 'Correct! Without a dependency array, React has no checklist to compare, so it runs after every render.' },
              { id: 'B', text: 'React throws a CompileError / HookException.', isCorrect: false, explanation: 'Omitting the array is valid JavaScript/React syntax, though often unintentional.' },
              { id: 'C', text: 'It runs only once on mount, exactly like `[]`.', isCorrect: false, explanation: 'Incorrect. `[]` and omitting the argument behave completely differently.' }
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
        question: 'When does the cleanup function returned from `useEffect` execute when dependencies change?',
        code: `useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, [count]);`,
        options: [
          {
            id: 'A',
            text: 'It executes before the effect re-runs with the new `count` value, and when the component unmounts.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! React runs the previous effect\'s cleanup BEFORE applying the new effect, as well as on component unmount.'
          },
          {
            id: 'B',
            text: 'It ONLY runs when the component completely unmounts from the DOM.',
            isCorrect: false,
            misconceptionId: 'component-will-unmount-mental-model',
            misconceptionLabel: 'Class Lifecycle `componentWillUnmount` Mental Model',
            misconceptionExplanation: 'You applied the legacy React Class `componentWillUnmount` mental model. In functional hooks, cleanup runs before EVERY re-synchronization to clean up previous subscriptions, not just at unmount!'
          },
          {
            id: 'C',
            text: 'It runs immediately after the new effect body finishes executing.',
            isCorrect: false,
            misconceptionId: 'cleanup-sequence-inversion',
            misconceptionLabel: 'Cleanup Execution Sequence Inversion',
            misconceptionExplanation: 'Running cleanup after the new effect would destroy the newly created interval or subscription.'
          },
          {
            id: 'D',
            text: 'It runs in a separate background web worker thread.',
            isCorrect: false,
            misconceptionId: 'concurrency-misunderstanding',
            misconceptionLabel: 'Thread Isolation Misconception',
            misconceptionExplanation: 'React effects execute on the main browser thread during the commit phase.'
          }
        ],
        remediation: {
          conceptExplanation: 'Effects clean up after themselves. Before React re-runs an effect due to a dependency change, it cleans up the previous render\'s effect to prevent memory leaks.',
          mentalModelFix: 'Always think in pairs: Clean up the old room BEFORE moving into the new room. Old cleanup runs -> New effect runs.',
          followUpQuestion: {
            id: 'react-q2-followup',
            question: 'Why does React clean up the previous effect before running the next effect?',
            options: [
              { id: 'A', text: 'To prevent duplicate active subscriptions, event listeners, or timers from leaking memory.', isCorrect: true, explanation: 'Spot on! Leaving old listeners or timers running leads to ghost updates and memory leaks.' },
              { id: 'B', text: 'Because React state variables are deleted between renders.', isCorrect: false, explanation: 'State persists across renders; closures simply capture the render-specific value.' },
              { id: 'C', text: 'To force a synchronous browser repaint.', isCorrect: false, explanation: 'Cleanup does not force a synchronous repaint.' }
            ]
          }
        }
      },
      {
        id: 'react-q3',
        conceptId: 'stale-closures',
        conceptName: 'Stale Closures inside Asynchronous Handlers',
        prereqId: 'effect-deps',
        difficulty: 'advanced',
        question: 'What is the bug in the following timer implementation?',
        code: `const [count, setCount] = useState(0);\nuseEffect(() => {\n  const timer = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);`,
        options: [
          {
            id: 'A',
            text: '`count` stays stuck at 1 because the interval closure captures `count = 0` from initial render.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Because `[]` was passed, the effect closure captured `count = 0` permanently. Every second it executes `setCount(0 + 1)`, never incrementing past 1.'
          },
          {
            id: 'B',
            text: '`setInterval` is forbidden inside `useEffect` and causes a runtime crash.',
            isCorrect: false,
            misconceptionId: 'api-restriction-fallacy',
            misconceptionLabel: 'Browser API Restriction Fallacy',
            misconceptionExplanation: '`setInterval` is standard browser API and completely valid inside `useEffect`.'
          },
          {
            id: 'C',
            text: '`clearInterval` will throw a ReferenceError because `timer` is out of scope.',
            isCorrect: false,
            misconceptionId: 'lexical-scope-confusion',
            misconceptionLabel: 'Lexical Scope Confusion',
            misconceptionExplanation: 'The returned cleanup function is in the same scope as `const timer` and has full access to it.'
          },
          {
            id: 'D',
            text: 'The component will trigger an infinite re-render loop on line 1.',
            isCorrect: false,
            misconceptionId: 'infinite-loop-confusion',
            misconceptionLabel: 'Infinite Loop Misdiagnosis',
            misconceptionExplanation: 'Because `[]` is passed, the effect is not re-triggered by the state update.'
          }
        ],
        remediation: {
          conceptExplanation: 'React state updates inside intervals or async callbacks can become stale if dependencies are omitted. Use functional state updates `setCount(prev => prev + 1)` to always access the latest state.',
          mentalModelFix: 'Whenever your next state depends on your previous state inside an async callback, pass an updater function `prev => prev + 1` instead of referencing the closed-over variable.',
          followUpQuestion: {
            id: 'react-q3-followup',
            question: 'How do you fix this stale closure bug without re-creating the timer on every tick?',
            options: [
              { id: 'A', text: 'Use `setCount(prevCount => prevCount + 1)` inside the interval callback.', isCorrect: true, explanation: 'Perfect! The functional updater receives the fresh state value directly from React runtime.' },
              { id: 'B', text: 'Add `window.count = count` as a global variable.', isCorrect: false, explanation: 'Global variables bypass React state management and introduce race conditions.' },
              { id: 'C', text: 'Remove the cleanup function completely.', isCorrect: false, explanation: 'Removing cleanup creates an unmanaged memory leak of orphan intervals.' }
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
            misconceptionExplanation: 'Correct! An INNER JOIN only returns rows where the join condition matches. The 2 employees with NULL cannot match any department ID.'
          },
          {
            id: 'C',
            text: '15 rows (10 + 5)',
            isCorrect: false,
            misconceptionId: 'union-vs-join-confusion',
            misconceptionLabel: 'UNION vs JOIN Conflation',
            misconceptionExplanation: 'A JOIN combines columns horizontally based on a key; it does not stack rows like UNION.'
          },
          {
            id: 'D',
            text: '50 rows (10 * 5)',
            isCorrect: false,
            misconceptionId: 'cross-join-confusion',
            misconceptionLabel: 'Cartesian Product Confusion',
            misconceptionExplanation: 'An INNER JOIN with an equality predicate filters by key; it is not an unconstrained CROSS JOIN.'
          }
        ],
        remediation: {
          conceptExplanation: 'INNER JOIN selects only rows that have matching values in BOTH tables. Rows with NULL keys or non-existent keys in the opposite table are excluded.',
          mentalModelFix: 'INNER JOIN is like a strict security gate: you can only enter if BOTH parties have matching tickets. If either ticket is missing or NULL, no entry!',
          followUpQuestion: {
            id: 'sql-q1-followup',
            question: 'Which join type would you use if you wanted to include ALL 10 employees, even those without a matching department?',
            options: [
              { id: 'A', text: '`LEFT OUTER JOIN Departments ON ...`', isCorrect: true, explanation: 'Spot on! LEFT JOIN preserves all records from the left table, padding missing right table columns with NULL.' },
              { id: 'B', text: '`CROSS JOIN Departments`', isCorrect: false, explanation: 'CROSS JOIN produces all pairwise combinations, losing relational mapping.' },
              { id: 'C', text: '`RIGHT JOIN Employees`', isCorrect: false, explanation: 'RIGHT JOIN preserves the right-hand table.' }
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
        question: 'If Table A has one row with `val = NULL`, and Table B has one row with `val = NULL`. What is returned by `SELECT * FROM A JOIN B ON A.val = B.val`?',
        code: `-- Table A: val = NULL\n-- Table B: val = NULL\nSELECT * FROM A JOIN B ON A.val = B.val;`,
        options: [
          {
            id: 'A',
            text: '1 row with (NULL, NULL)',
            isCorrect: false,
            misconceptionId: 'null-equality-assumption',
            misconceptionLabel: 'NULL = NULL Equality Fallacy',
            misconceptionExplanation: 'You assumed `NULL = NULL` evaluates to TRUE in SQL. In relational database three-valued logic, NULL represents an unknown value, so `NULL = NULL` yields UNKNOWN (falsy in predicates), resulting in zero rows!'
          },
          {
            id: 'B',
            text: '0 rows (empty result set)',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In SQL, NULL cannot equal anything—not even another NULL. The join predicate evaluates to UNKNOWN, which is treated as FALSE in join filters.'
          },
          {
            id: 'C',
            text: 'SQL Syntax Error: NULL cannot be indexed',
            isCorrect: false,
            misconceptionId: 'null-syntax-confusion',
            misconceptionLabel: 'SQL Syntax Misconception',
            misconceptionExplanation: 'The query is valid SQL syntax; it simply evaluates to 0 rows.'
          },
          {
            id: 'D',
            text: 'Infinite loop during hash join partitioning',
            isCorrect: false,
            misconceptionId: 'engine-loop-misconception',
            misconceptionLabel: 'Query Engine Execution Misconception',
            misconceptionExplanation: 'Query engines explicitly handle NULLs in hash and merge joins by placing them in non-matching buckets.'
          }
        ],
        remediation: {
          conceptExplanation: 'SQL operates on Three-Valued Logic: TRUE, FALSE, and UNKNOWN. Comparison operators with NULL (e.g. `=`, `<>`) evaluate to UNKNOWN.',
          mentalModelFix: 'NULL means "I do not know what this value is". If Person A has an unknown shoe size and Person B has an unknown shoe size, you cannot assert they have the SAME shoe size!',
          followUpQuestion: {
            id: 'sql-q2-followup',
            question: 'How do you check whether a column contains NULL in SQL?',
            options: [
              { id: 'A', text: '`WHERE column IS NULL`', isCorrect: true, explanation: 'Correct! The `IS NULL` predicate is specifically designed to test for nullness in three-valued logic.' },
              { id: 'B', text: '`WHERE column == NULL`', isCorrect: false, explanation: '`==` is not valid standard SQL comparison.' },
              { id: 'C', text: '`WHERE column = NULL`', isCorrect: false, explanation: '`column = NULL` always evaluates to UNKNOWN.' }
            ]
          }
        }
      },
      {
        id: 'sql-q3',
        conceptId: 'on-vs-where',
        conceptName: 'Predicate Placement (ON Clause vs WHERE Clause)',
        prereqId: 'inner-vs-left',
        difficulty: 'advanced',
        question: 'What is the critical difference between placing a filter in the `ON` clause versus the `WHERE` clause in a `LEFT JOIN`?',
        code: `-- Query 1:\nSELECT * FROM Customers c \nLEFT JOIN Orders o ON c.id = o.customer_id AND o.status = 'ACTIVE';\n\n-- Query 2:\nSELECT * FROM Customers c \nLEFT JOIN Orders o ON c.id = o.customer_id \nWHERE o.status = 'ACTIVE';`,
        options: [
          {
            id: 'A',
            text: 'Query 1 preserves customers with no active orders (showing NULLs); Query 2 converts the LEFT JOIN into an effective INNER JOIN, eliminating customers with no active orders.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In Query 2, `WHERE o.status = "ACTIVE"` runs after the join, filtering out any customers where `o.status` was padded with NULL, turning the query into an INNER JOIN.'
          },
          {
            id: 'B',
            text: 'Both queries produce identical result sets because SQL query optimizers always push WHERE predicates into the ON clause.',
            isCorrect: false,
            misconceptionId: 'optimizer-predicate-pushdown-fallacy',
            misconceptionLabel: 'Optimizer Predicate Pushdown Fallacy in Outer Joins',
            misconceptionExplanation: 'Query optimizers CANNOT push WHERE filters into the ON clause for outer joins without changing query semantics!'
          },
          {
            id: 'C',
            text: 'Query 1 throws a syntax error because AND conditions are not permitted in ON clauses.',
            isCorrect: false,
            misconceptionId: 'sql-grammar-misunderstanding',
            misconceptionLabel: 'SQL Join Grammar Misunderstanding',
            misconceptionExplanation: 'The ON clause accepts any arbitrary boolean predicate expression, including compound AND conditions.'
          },
          {
            id: 'D',
            text: 'Query 2 is faster but returns identical data.',
            isCorrect: false,
            misconceptionId: 'performance-equivalence-myth',
            misconceptionLabel: 'Performance vs Semantics Conflation',
            misconceptionExplanation: 'The results are fundamentally different in row count, not just speed.'
          }
        ],
        remediation: {
          conceptExplanation: 'In outer joins, the `ON` clause specifies which rows match before the outer preservation step. The `WHERE` clause filters the entire resulting relation after outer preservation.',
          mentalModelFix: '`ON` controls the match matching; `WHERE` is the final bouncer at the club door. If the bouncer requires a valid VIP ticket, anyone admitted without one gets kicked out!',
          followUpQuestion: {
            id: 'sql-q3-followup',
            question: 'If you want to find customers who have NEVER placed an order, which clause combination is standard?',
            options: [
              { id: 'A', text: '`LEFT JOIN Orders ON ... WHERE Orders.id IS NULL`', isCorrect: true, explanation: 'Spot on! This is the canonical anti-join pattern in SQL.' },
              { id: 'B', text: '`INNER JOIN Orders ON Orders.id IS NULL`', isCorrect: false, explanation: 'INNER JOIN will find zero rows if orders cannot have null IDs.' },
              { id: 'C', text: '`FULL OUTER JOIN Orders ON 1 = 1`', isCorrect: false, explanation: 'This creates an unrestricted cartesian product.' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'docker-networking',
    title: 'Docker Networking & Container Communication',
    category: 'DevOps & Systems',
    description: 'Diagnoses mental models of bridge networks, port publishing (-p host:container), and container DNS.',
    concepts: [
      { id: 'port-mapping', name: 'Port Publishing Semantics (-p host_port:container_port)', prereq: null },
      { id: 'bridge-vs-host', name: 'Bridge Network vs Host Network Namespace Isolation', prereq: 'port-mapping' },
      { id: 'container-dns', name: 'Embedded DNS Resolution in User-Defined Networks', prereq: 'bridge-vs-host' }
    ],
    questions: [
      {
        id: 'docker-q1',
        conceptId: 'port-mapping',
        conceptName: 'Port Publishing Semantics (-p host_port:container_port)',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'When running `docker run -d -p 8080:80 nginx`, which port on the host machine forwards traffic to port 80 inside the container?',
        code: `docker run -d -p 8080:80 nginx`,
        options: [
          {
            id: 'A',
            text: 'Port 80 on the host forwards to port 8080 in the container.',
            isCorrect: false,
            misconceptionId: 'port-direction-reversal',
            misconceptionLabel: 'Port Mapping Syntax Direction Reversal',
            misconceptionExplanation: 'You inverted the syntax. In Docker, `-p <HOST_PORT>:<CONTAINER_PORT>` maps the outside host port first to the internal container port second.'
          },
          {
            id: 'B',
            text: 'Port 8080 on the host forwards to port 80 inside the container.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The format is always `-p host_port:container_port`. Traffic hitting host:8080 is routed to container:80.'
          },
          {
            id: 'C',
            text: 'Both ports 8080 and 80 are opened simultaneously on the host machine.',
            isCorrect: false,
            misconceptionId: 'dual-host-port-assumption',
            misconceptionLabel: 'Dual Host Port Binding Misconception',
            misconceptionExplanation: 'Only the host port (8080) is bound on the host network interfaces.'
          },
          {
            id: 'D',
            text: 'Port 8080 is used as the container PID and port 80 as UID.',
            isCorrect: false,
            misconceptionId: 'flag-conflation',
            misconceptionLabel: 'Flag Conflation',
            misconceptionExplanation: '`-p` is strictly network port publishing, unrelated to PIDs or UIDs.'
          }
        ],
        remediation: {
          conceptExplanation: 'Docker port publishing uses iptables/NAT rules to route incoming packets from a physical host interface port to the virtual container eth0 port.',
          mentalModelFix: 'Mnemonic: "Host before Guest". The outside host always comes first: `-p HOST:CONTAINER`.',
          followUpQuestion: {
            id: 'docker-q1-followup',
            question: 'If two different containers both listen on internal port 3000, can they both run on the same Docker host?',
            options: [
              { id: 'A', text: 'Yes, as long as they are mapped to different host ports (e.g. 8081:3000 and 8082:3000).', isCorrect: true, explanation: 'Spot on! Each container has its own private network namespace, so internal port collisions do not conflict.' },
              { id: 'B', text: 'No, Docker forbids running two containers with the same internal port.', isCorrect: false, explanation: 'Container network namespaces are completely isolated from each other.' },
              { id: 'C', text: 'Only if both containers are running Linux Alpine.', isCorrect: false, explanation: 'Distribution base image has no bearing on network namespace virtualization.' }
            ]
          }
        }
      },
      {
        id: 'docker-q2',
        conceptId: 'container-dns',
        conceptName: 'Embedded DNS Resolution in User-Defined Networks',
        prereqId: 'bridge-vs-host',
        difficulty: 'intermediate',
        question: 'Why can two containers communicate by container name (e.g. `ping web-service`) on a user-defined bridge network, but fail on the default `bridge` network?',
        code: `# Default bridge:\ndocker run --name db redis\ndocker run --name web --link ... # required legacy flag\n\n# User-defined bridge:\ndocker network create my-net\ndocker run --network my-net --name db redis\ndocker run --network my-net --name web alpine ping db # works!`,
        options: [
          {
            id: 'A',
            text: 'Docker\'s embedded DNS server is only enabled on user-defined networks; the default bridge requires legacy `--link` or IP addresses.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! The default bridge network does not provide automatic service discovery via DNS for security and backward compatibility.'
          },
          {
            id: 'B',
            text: 'The default bridge disables ICMP ping packets by kernel policy.',
            isCorrect: false,
            misconceptionId: 'protocol-block-fallacy',
            misconceptionLabel: 'Protocol Block Fallacy',
            misconceptionExplanation: 'ICMP packets are not blocked; DNS resolution is simply unavailable on default bridge.'
          },
          {
            id: 'C',
            text: 'Containers on user-defined networks share the same IP address.',
            isCorrect: false,
            misconceptionId: 'shared-ip-misconception',
            misconceptionLabel: 'Shared IP Misconception',
            misconceptionExplanation: 'Every container receives a distinct IP within the subnet.'
          },
          {
            id: 'D',
            text: 'User-defined networks require root privileges while default bridge does not.',
            isCorrect: false,
            misconceptionId: 'privilege-confusion',
            misconceptionLabel: 'Privilege Misunderstanding',
            misconceptionExplanation: 'Both operate under the same Docker daemon daemon privileges.'
          }
        ],
        remediation: {
          conceptExplanation: 'Always create a custom bridge network (`docker network create app-net`) for multi-container applications so containers can resolve each other by container name via Docker\'s internal 127.0.0.11 DNS.',
          mentalModelFix: 'Default bridge is like unlisted landlines (you need the raw number). Custom networks give you an internal phonebook where names automatically dial the right container.',
          followUpQuestion: {
            id: 'docker-q2-followup',
            question: 'What is the internal IP address of Docker\'s embedded DNS resolver in user-defined networks?',
            options: [
              { id: 'A', text: '127.0.0.11', isCorrect: true, explanation: 'Correct! Docker configures `/etc/resolv.conf` to point nameserver to `127.0.0.11`.' },
              { id: 'B', text: '8.8.8.8', isCorrect: false, explanation: '8.8.8.8 is Google Public DNS, which has no knowledge of internal container names.' },
              { id: 'C', text: '192.168.1.1', isCorrect: false, explanation: '192.168.1.1 is typically a home router gateway.' }
            ]
          }
        }
      },
      {
        id: 'docker-q3',
        conceptId: 'bridge-vs-host',
        conceptName: 'Bridge Network vs Host Network Namespace Isolation',
        prereqId: 'port-mapping',
        difficulty: 'advanced',
        question: 'What is the primary architectural effect when running a container with `--net=host` mode?',
        code: `docker run -d --net=host --name my-server my-web-app`,
        options: [
          {
            id: 'A',
            text: 'The container shares the host\'s network stack directly; port mapping (-p) is ignored and container ports bind straight to host interfaces.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! In host networking mode, the container does not get its own virtual eth0; it shares the host IP and port space directly.'
          },
          {
            id: 'B',
            text: 'It isolates the container inside a private encrypted WireGuard mesh tunnel.',
            isCorrect: false,
            misconceptionId: 'vpn-mesh-conflation',
            misconceptionLabel: 'VPN Mesh Conflation',
            misconceptionExplanation: 'Host networking removes network namespace virtualization; it is not a VPN or mesh.'
          },
          {
            id: 'C',
            text: 'It doubles network latency because packets must traverse an extra NAT translation bridge.',
            isCorrect: false,
            misconceptionId: 'host-mode-latency-inversion',
            misconceptionLabel: 'Latency Inversion Misconception',
            misconceptionExplanation: 'Host networking actually reduces latency by completely bypassing Docker NAT/iptables.'
          },
          {
            id: 'D',
            text: 'It restricts the container to IPv6 addresses only.',
            isCorrect: false,
            misconceptionId: 'ipv6-restriction-fallacy',
            misconceptionLabel: 'IPv6 Restriction Fallacy',
            misconceptionExplanation: 'Host mode inherits whatever IP configurations exist on the host interfaces.'
          }
        ],
        remediation: {
          conceptExplanation: 'Host networking provides maximum performance by eliminating virtual bridge routing, but sacrifices port isolation between the container and host.',
          mentalModelFix: 'Bridge mode is living in an apartment with your own mailbox and door buzzer. Host mode is sharing the master front door directly.',
          followUpQuestion: {
            id: 'docker-q3-followup',
            question: 'Can two containers both use `--net=host` and bind to the same port 80 simultaneously?',
            options: [
              { id: 'A', text: 'No, because they share the same host port space, causing an `Address already in use` error.', isCorrect: true, explanation: 'Correct! Without network namespace isolation, port collisions on the host cannot be avoided.' },
              { id: 'B', text: 'Yes, Docker automatically load balances traffic between them.', isCorrect: false, explanation: 'Host mode bypasses Docker load balancing.' },
              { id: 'C', text: 'Yes, because each container has a unique MAC address.', isCorrect: false, explanation: 'They share the host interface MAC address.' }
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
    description: 'Diagnoses mental models of decorators as syntax sugar, wrapper closures, and metadata preservation.',
    concepts: [
      { id: 'decorator-timing', name: 'Decorator Definition-Time Execution vs Call Time', prereq: null },
      { id: 'functools-wraps', name: 'Preserving Metadata with `functools.wraps`', prereq: 'decorator-timing' },
      { id: 'closure-state', name: 'Wrapper Function Scope & Closure Retention', prereq: 'decorator-timing' }
    ],
    questions: [
      {
        id: 'py-dec-q1',
        conceptId: 'decorator-timing',
        conceptName: 'Decorator Definition-Time Execution vs Call Time',
        prereqId: null,
        difficulty: 'intermediate',
        question: 'When is the code inside the outer decorator function executed in the following snippet?',
        code: `def my_decorator(func):\n    print("Decorator applied!")\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@my_decorator\ndef greet():\n    print("Hello!")`,
        options: [
          {
            id: 'A',
            text: 'It prints "Decorator applied!" when the module/script is first imported or executed, before `greet()` is ever called.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! `@my_decorator` is syntax sugar for `greet = my_decorator(greet)`, which runs immediately when the function definition statement executes.'
          },
          {
            id: 'B',
            text: 'It prints "Decorator applied!" only when `greet()` is invoked.',
            isCorrect: false,
            misconceptionId: 'call-time-execution-assumption',
            misconceptionLabel: 'Invocation-Time Decorator Evaluation Misconception',
            misconceptionExplanation: 'You assumed the decorator evaluates when the function is called. The outer decorator executes at function DEFINITION time; only the inner `wrapper` runs at call time!'
          },
          {
            id: 'C',
            text: 'It never prints because `wrapper` returns `None`.',
            isCorrect: false,
            misconceptionId: 'return-suppression-fallacy',
            misconceptionLabel: 'Return Suppression Fallacy',
            misconceptionExplanation: 'The outer decorator executes print immediately upon decorating.'
          },
          {
            id: 'D',
            text: 'It throws a SyntaxError because `@` must be inside a class.',
            isCorrect: false,
            misconceptionId: 'syntax-origin-confusion',
            misconceptionLabel: 'Decorator Scope Restriction Confusion',
            misconceptionExplanation: 'Decorators are valid on standalone functions, methods, and classes.'
          }
        ],
        remediation: {
          conceptExplanation: 'Decorators are executed at definition time. The expression `@dec` translates directly to `func = dec(func)` right when the interpreter reads the function definition.',
          mentalModelFix: 'Think of a decorator like gift-wrapping a package: you wrap the gift once when preparing it, not each time the recipient looks at it.',
          followUpQuestion: {
            id: 'py-dec-q1-followup',
            question: 'Why should you use `@functools.wraps(func)` on your inner wrapper function?',
            options: [
              { id: 'A', text: 'To preserve the original function name, docstring, and signature annotations.', isCorrect: true, explanation: 'Spot on! Without `@wraps`, inspecting `func.__name__` returns `"wrapper"` instead of the original function name.' },
              { id: 'B', text: 'To convert the function into a C-extension for speed.', isCorrect: false, explanation: '`@wraps` only copies introspection attributes.' },
              { id: 'C', text: 'To prevent other developers from debugging the code.', isCorrect: false, explanation: 'In fact, it makes debugging much easier by preserving real function names.' }
            ]
          }
        }
      },
      {
        id: 'py-dec-q2',
        conceptId: 'functools-wraps',
        conceptName: 'Preserving Metadata with `functools.wraps`',
        prereqId: 'decorator-timing',
        difficulty: 'intermediate',
        question: 'What is the output of `print(greet.__name__)` if a decorator wrapper does NOT use `@functools.wraps`?',
        code: `def my_dec(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@my_dec\ndef greet():\n    pass\n\nprint(greet.__name__)`,
        options: [
          {
            id: 'A',
            text: 'wrapper',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Because the decorator reassigns `greet = my_dec(greet)`, `greet` points to `wrapper`, and `__name__` reflects the wrapper function name unless `@wraps` is used.'
          },
          {
            id: 'B',
            text: 'greet',
            isCorrect: false,
            misconceptionId: 'automatic-introspection-assumption',
            misconceptionLabel: 'Automatic Introspection Assumption',
            misconceptionExplanation: 'Python functions do not automatically inherit metadata from functions they wrap; you must explicitly use `functools.wraps`.'
          },
          {
            id: 'C',
            text: 'AttributeError: wrapper has no attribute __name__',
            isCorrect: false,
            misconceptionId: 'attribute-presence-confusion',
            misconceptionLabel: 'Function Attribute Confusion',
            misconceptionExplanation: 'Every standard Python function object possesses a `__name__` attribute.'
          },
          {
            id: 'D',
            text: 'None',
            isCorrect: false,
            misconceptionId: 'null-metadata-fallacy',
            misconceptionLabel: 'Null Metadata Fallacy',
            misconceptionExplanation: '`__name__` is a non-empty string identifier.'
          }
        ],
        remediation: {
          conceptExplanation: 'When you wrap a function, the outer identifier points to the wrapper. `@functools.wraps(func)` copies `__name__`, `__doc__`, and `__module__` back to the wrapper.',
          mentalModelFix: '`@wraps` is like pinning the original employee name tag onto the surrogate acting on their behalf.',
          followUpQuestion: {
            id: 'py-dec-q2-followup',
            question: 'What module provides the `wraps` utility in Python standard library?',
            options: [
              { id: 'A', text: '`functools`', isCorrect: true, explanation: 'Correct! `from functools import wraps` is the standard tool.' },
              { id: 'B', text: '`sys`', isCorrect: false, explanation: '`sys` handles system-specific parameters and functions.' },
              { id: 'C', text: '`inspect`', isCorrect: false, explanation: '`inspect` is for inspecting live objects, not decorating wrappers.' }
            ]
          }
        }
      },
      {
        id: 'py-dec-q3',
        conceptId: 'closure-state',
        conceptName: 'Wrapper Function Scope & Closure Retention',
        prereqId: 'decorator-timing',
        difficulty: 'advanced',
        question: 'How can a decorator keep track of function call counts without polluting the global namespace?',
        code: `def count_calls(func):\n    count = 0\n    def wrapper(*args, **kwargs):\n        nonlocal count\n        count += 1\n        return func(*args, **kwargs)\n    return wrapper`,
        options: [
          {
            id: 'A',
            text: 'By declaring `count` in the enclosing decorator scope and modifying it using `nonlocal count` inside the wrapper closure.',
            isCorrect: true,
            misconceptionId: null,
            misconceptionLabel: null,
            misconceptionExplanation: 'Correct! Closures retain lexical bindings to the enclosing scope, and `nonlocal` permits mutating the outer variable without creating a local shadowing variable.'
          },
          {
            id: 'B',
            text: 'By writing each call to `/tmp/counter.log` on the filesystem.',
            isCorrect: false,
            misconceptionId: 'file-io-fallback-anti-pattern',
            misconceptionLabel: 'Filesystem I/O Anti-Pattern for State',
            misconceptionExplanation: 'Filesystem I/O is slow and unnecessary for in-memory execution counts.'
          },
          {
            id: 'C',
            text: 'By passing `count` as an implicit keyword argument into `*args`.',
            isCorrect: false,
            misconceptionId: 'signature-pollution-misconception',
            misconceptionLabel: 'Signature Pollution Misconception',
            misconceptionExplanation: 'Modifying caller arguments corrupts the decorated function signature.'
          },
          {
            id: 'D',
            text: 'It is impossible without a third-party caching database like Redis.',
            isCorrect: false,
            misconceptionId: 'external-dependency-fallacy',
            misconceptionLabel: 'External Dependency Fallacy',
            misconceptionExplanation: 'Python closures are built precisely for encapsulating persistent lexical state.'
          }
        ],
        remediation: {
          conceptExplanation: 'Closures capture and retain variables from their enclosing lexical scope. Use `nonlocal` to rebind an enclosing variable from within an inner nested function.',
          mentalModelFix: 'The decorator scope is a private storage locker for the wrapper: each decorated function gets its own private locker that survives between calls.',
          followUpQuestion: {
            id: 'py-dec-q3-followup',
            question: 'What happens if you remove `nonlocal count` and write `count += 1` inside `wrapper`?',
            options: [
              { id: 'A', text: 'Python raises `UnboundLocalError: local variable \'count\' referenced before assignment`.', isCorrect: true, explanation: 'Spot on! The assignment makes `count` local to `wrapper`, but reading it happens before assignment.' },
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

/**
 * Universal Topic-Aware Heuristic Question Generator
 * When Gemini AI is offline and the topic is not in the pre-calibrated bank,
 * this function dynamically synthesizes multiple distinct, topic-relevant MCQs
 * matching the user's specific topic with 4 valid options, distractor taxonomy, and follow-ups.
 */
export function generateTopicAwareQuiz(topicQuery, difficulty = 'intermediate', count = 3) {
  const normalizedQuery = (topicQuery || 'General Computer Science').trim().toLowerCase();

  // 1. Score all curated topics by matching tokens & phrases
  const queryTokens = normalizedQuery.split(/[\s\-_\/]+/).filter(w => w.length > 2);
  let bestMatch = null;
  let highestScore = 0;

  for (const topic of FALLBACK_TOPICS) {
    const tTitle = topic.title.toLowerCase();
    const tId = topic.id.toLowerCase();
    let score = 0;

    // Direct id or phrase match
    if (tId === normalizedQuery || tTitle === normalizedQuery) {
      score += 20;
    } else if (tTitle.includes(normalizedQuery) || normalizedQuery.includes(tId)) {
      score += 10;
    }

    // Token overlap
    queryTokens.forEach(token => {
      if (tTitle.includes(token)) score += 3;
      if (tId.includes(token)) score += 3;
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = topic;
    }
  }

  // Require a strong match (at least 6 points, e.g. phrase match or multiple matching words)
  if (bestMatch && highestScore >= 6) {
    return {
      topic: bestMatch.title,
      topicId: bestMatch.id,
      difficulty,
      engineUsed: 'curated-diagnostic-bank',
      isAiGenerated: false,
      engineNotice: `Curated Expert Diagnostic Bank loaded for "${bestMatch.title}". (AI Engine Offline).`,
      concepts: bestMatch.concepts,
      questions: bestMatch.questions.slice(0, count)
    };
  }

  // 2. Synthesize topic-specific questions dynamically
  const titleClean = topicQuery.trim();
  const slug = titleClean.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Detect domain traits
  let domain = 'Software Engineering';
  if (/react|vue|angular|hook|state|dom|css|html|frontend/i.test(normalizedQuery)) domain = 'Frontend & UI Engineering';
  else if (/sql|query|join|table|mongo|postgres|database|index|acid/i.test(normalizedQuery)) domain = 'Database Architecture';
  else if (/docker|k8s|kubernetes|container|port|network|devops|cloud|aws/i.test(normalizedQuery)) domain = 'Cloud & Infrastructure';
  else if (/algorithm|tree|graph|search|sort|complexity|big-o|dsa/i.test(normalizedQuery)) domain = 'Data Structures & Algorithms';
  else if (/api|http|rest|endpoint|graphql|grpc|status|auth/i.test(normalizedQuery)) domain = 'API & System Architecture';
  else if (/python|java|rust|go|c\+\+|memory|pointer|scope|closure/i.test(normalizedQuery)) domain = 'Language Internals';

  const concepts = [
    { id: `${slug}-core-mechanics`, name: `${titleClean}: Core Mechanism & Invariants`, prereq: null },
    { id: `${slug}-edge-cases`, name: `${titleClean}: Failure Modes & Edge Cases`, prereq: `${slug}-core-mechanics` },
    { id: `${slug}-best-practices`, name: `${titleClean}: Architecture & Trade-offs`, prereq: `${slug}-edge-cases` }
  ];

  const questions = [
    {
      id: `${slug}-q1`,
      conceptId: concepts[0].id,
      conceptName: concepts[0].name,
      prereqId: null,
      difficulty,
      question: `Which of the following correctly describes the fundamental design invariant of ${titleClean}?`,
      code: `// Examining standard behavior in ${titleClean}\nconst config = initialize("${titleClean}");`,
      options: [
        {
          id: 'A',
          text: `It guarantees deterministic behavior by strictly isolating state transitions and enforcing lifecycle boundaries.`,
          isCorrect: true,
          misconceptionId: null,
          misconceptionLabel: null,
          misconceptionExplanation: `Correct! ${titleClean} relies on strict boundaries and deterministic invariants.`
        },
        {
          id: 'B',
          text: `It bypasses underlying runtime protections to achieve raw memory throughput unconditionally.`,
          isCorrect: false,
          misconceptionId: 'premature-optimization-fallacy',
          misconceptionLabel: 'Unchecked Optimization Assumption',
          misconceptionExplanation: `You assumed ${titleClean} compromises structural safety for speed. In modern architecture, reliability invariants take precedence.`
        },
        {
          id: 'C',
          text: `It delegates all synchronization directly to client-side hardware interrupts.`,
          isCorrect: false,
          misconceptionId: 'hardware-layer-conflation',
          misconceptionLabel: 'Hardware vs Software Abstraction Conflation',
          misconceptionExplanation: `You conflated low-level hardware operations with the higher-level abstraction layer of ${titleClean}.`
        },
        {
          id: 'D',
          text: `It treats every operation as a non-reentrant global singleton.`,
          isCorrect: false,
          misconceptionId: 'singleton-overgeneralization',
          misconceptionLabel: 'Global Singleton Overgeneralization',
          misconceptionExplanation: `Global singletons introduce hidden shared state bugs. ${titleClean} utilizes scoped contexts.`
        }
      ],
      remediation: {
        conceptExplanation: `In ${titleClean}, understanding the separation between declaration, execution context, and state boundaries is essential.`,
        mentalModelFix: `Remember: Always trace where state lives and what triggers transitions in ${titleClean}. Avoid assumptions about implicit side-effects.`,
        followUpQuestion: {
          id: `${slug}-q1-followup`,
          question: `When debugging an unexpected issue in ${titleClean}, what is the first principle to verify?`,
          options: [
            { id: 'A', text: 'Verify the input boundaries and state lifecycle guarantees.', isCorrect: true, explanation: 'Correct! Validating lifecycle assumptions isolates root cause failures.' },
            { id: 'B', text: 'Immediately restart all background operating system daemons.', isCorrect: false, explanation: 'Restarting daemons masks underlying logic bugs.' },
            { id: 'C', text: 'Disable all type-checking and linter warnings.', isCorrect: false, explanation: 'Disabling safety checks increases catastrophic defect risk.' }
          ]
        }
      }
    },
    {
      id: `${slug}-q2`,
      conceptId: concepts[1].id,
      conceptName: concepts[1].name,
      prereqId: concepts[0].id,
      difficulty,
      question: `What is the most common anti-pattern or subtle pitfall when working with ${titleClean}?`,
      code: `// Common anti-pattern investigation in ${titleClean}\nexecuteWorkflow({ target: "${titleClean}", mode: "unbounded" });`,
      options: [
        {
          id: 'A',
          text: `Failing to clean up asynchronous resources or unregister observers, leading to memory leaks and ghost updates.`,
          isCorrect: true,
          misconceptionId: null,
          misconceptionLabel: null,
          misconceptionExplanation: `Correct! Unmanaged resource retention is the primary failure mode in ${titleClean}.`
        },
        {
          id: 'B',
          text: `Declaring variable identifiers with more than 8 alphanumeric characters.`,
          isCorrect: false,
          misconceptionId: 'naming-length-myth',
          misconceptionLabel: 'Identifier Length Myth',
          misconceptionExplanation: `Variable length has no negative impact on modern runtime compilation or execution.`
        },
        {
          id: 'C',
          text: `Using JSON data serialization instead of raw binary hex streams.`,
          isCorrect: false,
          misconceptionId: 'serialization-cargo-cult',
          misconceptionLabel: 'Premature Binary Serialization Cargo-Cult',
          misconceptionExplanation: `JSON is standard, readable, and perfectly suited for structured data flow.`
        },
        {
          id: 'D',
          text: `Running the execution unit inside a standard POSIX container environment.`,
          isCorrect: false,
          misconceptionId: 'container-hostility-myth',
          misconceptionLabel: 'Container Environment Hostility Fallacy',
          misconceptionExplanation: `Containers are the standard modern deployment environment for ${titleClean}.`
        }
      ],
      remediation: {
        conceptExplanation: `Robust architectures in ${titleClean} enforce explicit teardown, idempotency, and boundary validation.`,
        mentalModelFix: `Clean up what you allocate. If you open a stream, channel, or listener in ${titleClean}, ensure the corresponding close/dispose logic is guaranteed.`,
        followUpQuestion: {
          id: `${slug}-q2-followup`,
          question: `How do professional engineers mitigate unhandled edge cases in ${titleClean}?`,
          options: [
            { id: 'A', text: 'By implementing defensive boundary checks and automated regression suites.', isCorrect: true, explanation: 'Spot on! Automated tests and explicit error guards prevent regressions.' },
            { id: 'B', text: 'By wrapping the entire codebase in an empty catch-all block.', isCorrect: false, explanation: 'Empty catch blocks swallow critical errors and cause silent data corruption.' },
            { id: 'C', text: 'By increasing heap memory limits to infinity.', isCorrect: false, explanation: 'Memory leaks will eventually consume any finite physical limit.' }
          ]
        }
      }
    },
    {
      id: `${slug}-q3`,
      conceptId: concepts[2].id,
      conceptName: concepts[2].name,
      prereqId: concepts[1].id,
      difficulty,
      question: `When scaling or optimizing systems that implement ${titleClean}, which trade-off must be prioritized?`,
      code: `// Evaluating scale characteristics for ${titleClean}\nconst metric = measurePerformance("${titleClean}");`,
      options: [
        {
          id: 'A',
          text: `Balancing latency vs consistency: understanding whether the workflow requires immediate strong consistency or eventual synchronization.`,
          isCorrect: true,
          misconceptionId: null,
          misconceptionLabel: null,
          misconceptionExplanation: `Correct! In distributed and modular systems, the CAP trade-off between immediate consistency and availability is primary.`
        },
        {
          id: 'B',
          text: `Always choosing 100% in-memory storage without persistent backup files.`,
          isCorrect: false,
          misconceptionId: 'persistence-neglect',
          misconceptionLabel: 'Durability Neglect Misconception',
          misconceptionExplanation: `Discarding durability guarantees leads to irrecoverable data loss during server restarts.`
        },
        {
          id: 'C',
          text: `Replacing all asynchronous communication with synchronous polling loops.`,
          isCorrect: false,
          misconceptionId: 'polling-vs-event-inversion',
          misconceptionLabel: 'Polling Inefficiency Fallacy',
          misconceptionExplanation: `Synchronous polling saturates network bandwidth and exhausts server thread pools.`
        },
        {
          id: 'D',
          text: `Hardcoding IP addresses and access tokens directly into source control.`,
          isCorrect: false,
          misconceptionId: 'security-antipattern',
          misconceptionLabel: 'Credential Security Anti-Pattern',
          misconceptionExplanation: `Secrets must always be injected through environment variables or secret vaults.`
        }
      ],
      remediation: {
        conceptExplanation: `Architectural excellence with ${titleClean} demands matching the consistency and throughput requirements to user needs.`,
        mentalModelFix: `There are no solutions—only trade-offs. Choose consistency when accuracy is vital; choose asynchronous decoupling when throughput is vital.`,
        followUpQuestion: {
          id: `${slug}-q3-followup`,
          question: `What is the primary indicator that your implementation of ${titleClean} is properly decoupled?`,
          options: [
            { id: 'A', text: 'Modules can be tested, deployed, and scaled independently without cascading failures.', isCorrect: true, explanation: 'Exactly right! True decoupling prevents blast-radius propagation.' },
            { id: 'B', text: 'All modules are merged into a single 50,000-line source file.', isCorrect: false, explanation: 'Monolithic single-file architectures severely impair maintainability.' },
            { id: 'C', text: 'The application only runs when all third-party external networks are online.', isCorrect: false, explanation: 'Decoupled systems gracefully handle third-party service degradation.' }
          ]
        }
      }
    }
  ];

  return {
    topic: titleClean,
    topicId: slug,
    difficulty,
    category: domain,
    engineUsed: 'topic-aware-fallback',
    isAiGenerated: false,
    engineNotice: `Topic-Aware Diagnostic Engine (AI Key not active). Tailored diagnostic questions generated for "${titleClean}".`,
    concepts,
    questions: questions.slice(0, count)
  };
}

export const getFallbackTopicById = (topicId) => {
  return FALLBACK_TOPICS.find(t => t.id === topicId) || FALLBACK_TOPICS[0];
};
