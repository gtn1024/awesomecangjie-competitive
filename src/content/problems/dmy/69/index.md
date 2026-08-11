---
oj: dmy
pid: '69'
title: '[R12C] 训练指令'
difficulty: 普及-
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 3 \times 10^5$，$1 \le x_i \le n$。

## 思路

朴素模拟每条指令「把同学 $x_i$ 左边的人都右移一位」是 $O(nm)$ 的，会超时。

关键观察：一个同学如果在多条指令里出现，**只有最后一次移动决定他在最终队列里的相对位置**——更早的移动都会被后面的覆盖。并且「最后一次移动」越靠后的同学，在最终队列里越靠左。

所以把指令**倒序**处理，每遇到一个**尚未出现过**的同学 $x_i$，就把它记入「被移动过」的序列。由于是倒序扫描，最先记入的就是最后被移动的同学，它会排在最终队列的最左边；同理，从未被任何指令点名过的同学保持初始的相对顺序（即编号升序），排在所有被移动过的同学之后。

用一个哈希集合维护「是否已被记入」，避免同一个同学被重复记录。整体时间 $O(n + m)$，空间 $O(n + m)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line0[0]
    let m = line0[1]

    // 读入 m 条指令
    let xs = Array<Int64>(m, { _ => 0 })
    for (i in 0..m) {
        xs[i] = Int64.parse(reader.readln().getOrThrow())
    }

    // 倒序处理：每条指令第一次遇到（即该同学最后一次被移动）的，按倒序加入 moved，
    // 这样 moved 末尾是最早被移动的，开头是最后被移动的。
    let seen = HashSet<Int64>()
    let moved = ArrayList<Int64>()
    var i = m - 1
    while (i >= 0) {
        let x = xs[i]
        if (!seen.contains(x)) {
            seen.add(x)
            moved.add(x)
        }
        i = i - 1
    }

    // 输出：moved 按加入顺序（最后被移动的在最前），再输出未被移动的同学（编号 1..n 保持原序）
    var first = true
    for (idx in 0..moved.size) {
        if (!first) {
            print(" ")
        }
        print(moved[idx])
        first = false
    }
    for (v in 1..(n + 1)) {
        if (!seen.contains(Int64(v))) {
            if (!first) {
                print(" ")
            }
            print(Int64(v))
            first = false
        }
    }
    println()
}
```

要点：

- 倒序扫描指令配合哈希集合去重，使每个同学只被记入一次，且记入顺序就是最终从左到右的相对顺序，无需真正搬运数组。
- `1..(n + 1)` 枚举未被移动的同学时，按编号升序遍历正好保持它们在原队列中的相对顺序。
