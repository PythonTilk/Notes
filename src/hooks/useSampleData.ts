import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getSampleNotes = (): Note[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: uuidv4(),
      title: 'Welcome to TakeNote',
      content: `# Welcome to TakeNote! 📝

This is a modern, developer-focused note-taking app inspired by the original TakeNote by Tania Rascia.

## Features

- **Markdown Support**: Write notes in Markdown with live preview
- **Syntax Highlighting**: Code blocks are highlighted based on language
- **Keyboard Shortcuts**: Use Ctrl+N, Ctrl+S, Ctrl+F, Ctrl+P, and more
- **Local Storage**: Your notes are stored locally in your browser
- **Export**: Download all your notes as a ZIP file
- **Dark/Light Mode**: Toggle between themes
- **Search**: Quickly find notes by title or content
- **Categories**: Organize notes into categories
- **Favorites**: Star important notes

## Getting Started

1. Press **Ctrl+N** to create a new note
2. Use **Ctrl+P** to toggle the preview pane
3. Press **Ctrl+F** to search your notes
4. Click the ⚙️ icon to access settings

## Linked Notes

You can link to other notes using the \`{{note-title}}\` syntax. For example: {{JavaScript Cheat Sheet}}

Happy note-taking! 🚀`,
      category: 'general',
      tags: ['welcome', 'tutorial'],
      favorite: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'JavaScript Cheat Sheet',
      content: `# JavaScript Cheat Sheet

## Variables
\`\`\`javascript
// ES6 way
const name = 'John';
let age = 30;

// Old way (avoid)
var city = 'New York';
\`\`\`

## Functions
\`\`\`javascript
// Arrow function
const greet = (name) => \`Hello, \${name}!\`;

// Regular function
function calculate(a, b) {
  return a + b;
}

// Async function
const fetchData = async () => {
  const response = await fetch('/api/data');
  return response.json();
};
\`\`\`

## Array Methods
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Map
const doubled = numbers.map(n => n * 2);

// Filter
const evens = numbers.filter(n => n % 2 === 0);

// Reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Find
const found = numbers.find(n => n > 3);
\`\`\`

## Object Destructuring
\`\`\`javascript
const user = { name: 'John', age: 30, city: 'NYC' };

// Destructuring
const { name, age } = user;

// With default values
const { country = 'USA' } = user;
\`\`\`

## Promises
\`\`\`javascript
// Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Done!'), 1000);
});

// Async/Await
const result = await promise;

// Promise.all
const results = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts')
]);
\`\`\``,
      category: 'development',
      tags: ['javascript', 'cheatsheet', 'reference'],
      favorite: true,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: uuidv4(),
      title: 'React Hooks Notes',
      content: `# React Hooks

## useState
\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## useEffect
\`\`\`javascript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // Dependency array
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

## Custom Hooks
\`\`\`javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, setStoredValue];
}
\`\`\`

## useCallback & useMemo
\`\`\`javascript
import { useCallback, useMemo } from 'react';

function ExpensiveComponent({ items, onItemClick }) {
  // Memoize expensive calculation
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  // Memoize callback
  const handleClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return (
    <div>
      <p>Total: {expensiveValue}</p>
      {items.map(item => (
        <button key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}
\`\`\``,
      category: 'development',
      tags: ['react', 'hooks', 'frontend'],
      favorite: false,
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
    {
      id: uuidv4(),
      title: 'Meeting Notes - Project Planning',
      content: `# Project Planning Meeting
**Date**: ${now.toDateString()}
**Attendees**: John, Sarah, Mike, Lisa

## Agenda
1. Project timeline review
2. Resource allocation
3. Risk assessment
4. Next steps

## Discussion Points

### Timeline
- Phase 1: Research and planning (2 weeks)
- Phase 2: Development (6 weeks)
- Phase 3: Testing and deployment (2 weeks)
- **Total**: 10 weeks

### Resources
- **Frontend**: 2 developers
- **Backend**: 2 developers
- **Design**: 1 designer
- **QA**: 1 tester

### Risks
- [ ] Third-party API dependencies
- [ ] Database migration complexity
- [ ] User acceptance testing timeline
- [x] Team availability during holidays

## Action Items
- [ ] Sarah: Create detailed project timeline
- [ ] Mike: Research third-party APIs
- [ ] Lisa: Prepare test scenarios
- [x] John: Book follow-up meeting

## Next Meeting
**Date**: Next Friday at 2 PM
**Location**: Conference Room B`,
      category: 'meetings',
      tags: ['meeting', 'planning', 'project'],
      favorite: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Python Quick Reference',
      content: `# Python Quick Reference

## Data Types
\`\`\`python
# Numbers
age = 25
price = 19.99
complex_num = 3 + 4j

# Strings
name = "John Doe"
message = f"Hello, {name}!"

# Lists
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]

# Dictionaries
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}

# Sets
unique_numbers = {1, 2, 3, 4, 5}
\`\`\`

## Functions
\`\`\`python
# Basic function
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# Lambda function
square = lambda x: x ** 2

# Decorator
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "Done"
\`\`\`

## List Comprehensions
\`\`\`python
# Basic list comprehension
squares = [x**2 for x in range(10)]

# With condition
evens = [x for x in range(20) if x % 2 == 0]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ["hello", "world", "python"]}

# Set comprehension
unique_squares = {x**2 for x in range(-5, 6)}
\`\`\`

## Classes
\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"Hi, I'm {self.name} and I'm {self.age} years old"
    
    @property
    def is_adult(self):
        return self.age >= 18
    
    @staticmethod
    def species():
        return "Homo sapiens"

# Usage
person = Person("Alice", 25)
print(person.introduce())
print(person.is_adult)
\`\`\``,
      category: 'development',
      tags: ['python', 'reference', 'programming'],
      favorite: false,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ];
};

export const getSampleCategories = () => [
  { id: 'general', name: 'General', color: '#6366f1' },
  { id: 'development', name: 'Development', color: '#10b981' },
  { id: 'meetings', name: 'Meetings', color: '#f59e0b' },
  { id: 'personal', name: 'Personal', color: '#ec4899' },
];