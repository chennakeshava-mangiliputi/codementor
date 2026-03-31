export interface InterviewProblem {
  title: string;
  description: string;
  input: string;
  output: string;
  constraints: string;
}

const questionBank: Record<string, InterviewProblem[]> = {
  Easy: [
    {
      title: "String Reverse",
      description:
        "Given a string, return a new string with the characters in reverse order.",
      input: "A single string.",
      output: "The reversed string.",
      constraints: "String length is between 1 and 10^5.",
    },
    {
      title: "Palindrome Check",
      description:
        "Given a string, determine whether it reads the same forward and backward after ignoring casing.",
      input: "A single string.",
      output: "Return true if the string is a palindrome, otherwise false.",
      constraints: "String length is between 1 and 10^5.",
    },
    {
      title: "Array Sum",
      description:
        "Given an array of integers, return the sum of all elements in the array.",
      input: "The first line contains n. The second line contains n integers.",
      output: "A single integer representing the array sum.",
      constraints: "1 <= n <= 10^5.",
    },
    {
      title: "Remove Duplicates From Sorted Array",
      description:
        "Given a sorted array, remove duplicates in place and return the number of unique elements.",
      input: "The first line contains n. The second line contains n sorted integers.",
      output: "The count of unique elements after in-place deduplication.",
      constraints: "1 <= n <= 10^5.",
    },
    {
      title: "Prime Number Check",
      description:
        "Given a positive integer, determine whether it is a prime number.",
      input: "A single integer n.",
      output: "Return true if n is prime, otherwise false.",
      constraints: "1 <= n <= 10^9.",
    },
    {
      title: "Fibonacci Number",
      description:
        "Given an integer n, return the nth Fibonacci number using an efficient iterative approach.",
      input: "A single integer n.",
      output: "The nth Fibonacci number.",
      constraints: "0 <= n <= 50.",
    },
    {
      title: "First Non-Repeating Character",
      description:
        "Given a string, return the first character that appears exactly once. If every character repeats, return an empty character indicator agreed in the target language.",
      input: "A single string containing lowercase English letters.",
      output:
        "The first non-repeating character, or an empty indicator if none exists.",
      constraints: "String length is between 1 and 10^5.",
    },
    {
      title: "Balanced Palindrome Cleanup",
      description:
        "Given a string, remove all non-alphanumeric characters, ignore casing, and determine whether the cleaned string is a palindrome.",
      input: "A single string that may contain spaces and punctuation.",
      output: "Return true if the cleaned string is a palindrome, otherwise false.",
      constraints: "String length is between 1 and 10^5.",
    },
    {
      title: "Second Largest Unique Number",
      description:
        "Given an integer array, return the second largest distinct value. If there is no second distinct value, return an agreed fallback such as -1.",
      input: "The first line contains n. The second line contains n integers.",
      output: "Return the second largest distinct integer or the fallback value.",
      constraints: "1 <= n <= 10^5. Values fit in 32-bit signed integers.",
    },
    {
      title: "Longest Common Prefix",
      description:
        "Given a list of strings, find the longest prefix shared by all of them.",
      input: "The first line contains n. The next n lines contain one string each.",
      output: "Return the longest common prefix. Return an empty string if none exists.",
      constraints: "1 <= n <= 10^4. Total characters across all strings <= 10^5.",
    },
    {
      title: "Frequency Sorted Characters",
      description:
        "Given a string, return its characters sorted by descending frequency. Characters with the same frequency may appear in any order.",
      input: "A single string.",
      output: "A string with the same characters arranged by descending frequency.",
      constraints: "String length is between 1 and 10^5.",
    },
  ],
  Medium: [
    {
      title: "Two Sum",
      description:
        "Given an array of integers and a target value, return the indices of the two numbers whose sum equals the target.",
      input: "The first line contains n and target. The second line contains n integers.",
      output: "Two indices in any order, or an agreed empty result if no pair exists.",
      constraints: "2 <= n <= 10^5.",
    },
    {
      title: "Binary Search",
      description:
        "Given a sorted array and a target value, return the index of the target or -1 if it does not exist.",
      input: "The first line contains n and target. The second line contains n sorted integers.",
      output: "A single integer index or -1.",
      constraints: "1 <= n <= 10^5. Aim for O(log n) time.",
    },
    {
      title: "Longest Substring Without Repeating Characters",
      description:
        "Given a string, return the length of the longest substring that contains no repeated characters.",
      input: "A single string.",
      output: "A single integer representing the maximum substring length.",
      constraints: "String length is between 1 and 10^5.",
    },
    {
      title: "Merge Intervals",
      description:
        "Given a list of intervals, merge all overlapping intervals and return the condensed result.",
      input: "The first line contains n. Each of the next n lines contains a start and end value.",
      output: "The merged list of non-overlapping intervals.",
      constraints: "1 <= n <= 10^5.",
    },
    {
      title: "Reverse Linked List",
      description:
        "Given the head of a singly linked list, reverse the list and return the new head.",
      input: "A linked list represented as a sequence of node values.",
      output: "The reversed linked list.",
      constraints: "1 <= number of nodes <= 10^5.",
    },
    {
      title: "Product of Array Except Self",
      description:
        "Given an array of integers, return a new array where each element is the product of all other elements except itself, without using division.",
      input: "The first line contains n. The second line contains n integers.",
      output: "An array of n integers where each position contains the product except self.",
      constraints: "2 <= n <= 10^5. Use O(n) time.",
    },
    {
      title: "Group Anagrams",
      description:
        "Given a list of lowercase strings, group together strings that are anagrams of each other.",
      input: "The first line contains n. The next n lines contain one string each.",
      output: "A list of grouped strings where each group contains only anagrams.",
      constraints: "1 <= n <= 10^4. Total characters across all strings <= 10^5.",
    },
    {
      title: "Minimum Meeting Rooms",
      description:
        "Given meeting time intervals, determine the minimum number of rooms required so that no meetings overlap in the same room.",
      input: "The first line contains n. Each of the next n lines contains start and end times.",
      output: "A single integer representing the minimum number of rooms required.",
      constraints: "1 <= n <= 10^5. 0 <= start < end <= 10^9.",
    },
    {
      title: "Rotated Sorted Array Search",
      description:
        "Given a sorted array that has been rotated at an unknown pivot, return the index of a target value or -1 if it is not present.",
      input: "The first line contains n and target. The second line contains n distinct integers.",
      output: "A single integer index, or -1 if the target is absent.",
      constraints: "1 <= n <= 10^5. Aim for O(log n) time.",
    },
    {
      title: "Validate Stack Sequences",
      description:
        "Given two integer sequences pushed and popped, determine whether they could represent valid push and pop operations on the same stack.",
      input: "The first line contains n. The second line contains the pushed sequence. The third line contains the popped sequence.",
      output: "Return true if the sequences are valid, otherwise false.",
      constraints: "1 <= n <= 10^5.",
    },
  ],
  Hard: [
    {
      title: "Sliding Window Maximum",
      description:
        "Given an array and a window size k, return the maximum value in each sliding window as it moves from left to right.",
      input: "The first line contains n and k. The second line contains n integers.",
      output: "An array of window maximum values.",
      constraints: "1 <= n <= 10^5. 1 <= k <= n.",
    },
    {
      title: "Topological Sort of Directed Graph",
      description:
        "Given a directed acyclic graph, return a valid topological ordering of its nodes.",
      input: "The first line contains n and m. The next m lines contain directed edges.",
      output: "A valid topological order of all nodes.",
      constraints: "1 <= n <= 10^5.",
    },
    {
      title: "Longest Increasing Subsequence",
      description:
        "Given an integer array, return the length of the longest strictly increasing subsequence.",
      input: "The first line contains n. The second line contains n integers.",
      output: "A single integer representing the LIS length.",
      constraints: "1 <= n <= 10^5.",
    },
    {
      title: "Word Ladder Length",
      description:
        "Given a begin word, end word, and dictionary, compute the minimum number of single-letter transformations required to convert the begin word into the end word.",
      input: "The first line contains beginWord and endWord. The second line contains n. The next n lines contain dictionary words.",
      output: "A single integer representing the shortest transformation length, or 0 if impossible.",
      constraints: "1 <= dictionary size <= 10^5. All words have the same length.",
    },
    {
      title: "Task Scheduler With Cooldown",
      description:
        "Given tasks represented by capital letters and a cooldown interval, compute the least number of time slots needed to finish all tasks.",
      input: "A list of task letters and a non-negative integer cooldown.",
      output: "A single integer representing the minimum number of time slots required.",
      constraints: "1 <= number of tasks <= 10^5.",
    },
    {
      title: "Minimum Window Substring",
      description:
        "Given two strings source and target, return the smallest substring of source that contains all characters from target with correct frequencies.",
      input: "Two strings, source and target.",
      output: "The minimum window substring, or an empty string if none exists.",
      constraints: "Combined string length <= 2 * 10^5.",
    },
    {
      title: "Course Schedule Ordering",
      description:
        "Given a number of courses and prerequisite pairs, return a valid order to finish all courses, or an empty list if no valid ordering exists.",
      input: "The first line contains numCourses and m. The next m lines contain prerequisite pairs.",
      output: "A valid ordering of courses, or an empty list if a cycle exists.",
      constraints: "1 <= numCourses <= 10^5.",
    },
    {
      title: "LRU Cache Design",
      description:
        "Design an LRU cache supporting get and put in constant average time. Evict the least recently used item when the cache reaches capacity.",
      input: "A cache capacity followed by a sequence of get and put operations.",
      output: "For each get operation, return the retrieved value or -1 if not found.",
      constraints: "1 <= capacity <= 3000. Up to 2 * 10^5 operations.",
    },
  ],
};

export function normalizeProblemTitle(title: string) {
  return title.trim().toLowerCase();
}

export function getFallbackProblem(difficulty: string, excludedTitles: string[] = []) {
  const bank = questionBank[difficulty] ?? questionBank.Medium;
  const excluded = new Set(excludedTitles.map(normalizeProblemTitle));
  const available = bank.filter(
    (problem) => !excluded.has(normalizeProblemTitle(problem.title)),
  );
  const source = available.length ? available : bank;

  return source[Math.floor(Math.random() * source.length)];
}

export function getDiversityPrompt(
  difficulty: string,
  previousTitles: string[] = [],
) {
  const bank = questionBank[difficulty] ?? questionBank.Medium;
  const titles = bank.map((problem) => problem.title).join(", ");
  const excluded = previousTitles.length
    ? ` Do not repeat any of these recently used titles: ${previousTitles.join(", ")}.`
    : "";

  return `Use common real interview themes for ${difficulty} candidates such as: ${titles}. Avoid trivial prompts like checking even or odd numbers or summing two numbers.${excluded}`;
}
