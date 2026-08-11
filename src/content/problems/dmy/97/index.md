---
oj: dmy
pid: '97'
title: '[R17A]谁在装弱'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le b_i \le 10^6$，满分为 $10^6$，且 $b$ 序列非递增。

## 思路

按题意，恰好一个同学装弱：把第 $i$ 名的真实分数 $a_i = b_i + 10$，其余位置 $a_j = b_j$。装弱的人选 $i$ 合法，当且仅当替换后真实分数序列 $a$ 仍满足**非递增**，且每个 $a_i \le 10^6$（满分约束）。

由于原 $b$ 序列已是非递增的，把第 $i$ 位从 $b_i$ 改成 $b_i + 10$（变大）只会破坏第 $i$ 位附近的相邻关系，远处不受影响。因此逐个枚举 $i$，只需检查三个条件：

1. **满分约束**：$b_i + 10 \le 10^6$。例如样例 1 的第 1 名 $b_1 = 999991$，真实分数 $1000001$ 超过满分，不合法。
2. **与左边的关系**（$i > 1$）：$b_{i-1} \ge b_i + 10$。否则第 $i$ 名真实分数超过第 $i-1$ 名，破坏降序。样例 1 的第 2 名 $b_1 = 999991 < 999992$ 即不合法。
3. **与右边的关系**（$i < n$）：$b_i + 10 \ge b_{i+1}$。否则第 $i+1$ 名反而更高，破坏降序。样例 1 的第 5 名 $b_4 = 10 < b_5 + 10 = 20$ 不合法。

三个条件都满足的 $i$ 即可能是装弱者，统计个数即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let FULL: Int64 = 1000000
    var ans: Int64 = 0
    for (i in 0..n) {
        let real = b[i] + 10
        if (real > FULL) {
            continue
        }
        // 检查替换后序列保持非递增 b[i-1] >= b[i]（real 放在位置 i）
        var ok = true
        if (i > 0) {
            if (b[i - 1] < real) {
                ok = false
            }
        }
        if (ok && i < n - 1) {
            if (real < b[i + 1]) {
                ok = false
            }
        }
        if (ok) {
            ans += 1
        }
    }
    println(ans.toString())
    return 0
}
```
