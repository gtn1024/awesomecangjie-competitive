---
oj: dmy
pid: '73'
title: '[R13A] 连续下降'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le A_i \le 10^5$。

## 思路

扫描一遍数组，检查每个 $i$（$1 \le i \le n-2$）是否满足 $A_i > A_{i+1} > A_{i+2}$，满足则计数加一。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    for (i in 0..(n - 2)) {
        if (a[i] > a[i + 1] && a[i + 1] > a[i + 2]) {
            ans = ans + 1
        }
    }
    println(ans)
}
```

要点：

- 数组下标从 0 开始，条件 $1 \le i \le n-2$ 对应 `0..(n - 2)`，区间不含右端点，恰好枚举到 $n-3$。
- 两个不等号连写拆成两个独立的比较，`a[i] > a[i + 1] && a[i + 1] > a[i + 2]` 清晰且不会歧义。
