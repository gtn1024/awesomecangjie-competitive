---
oj: dmy
pid: '459'
title: '[R74C] 中继站迁移方案'
difficulty: 入门
tags:
  - 枚举
  - 模拟
  - 排序
timeLimit: 2s
memoryLimit: 256m
---

> 数据规模：$3 \le n \le 60$，$1 \le k \le 1000$，$0 \le a_1 < a_2 < \cdots < a_n \le 1000$。

## 思路

坐标范围很小（$a_n \le 1000$），直接枚举所有可能的迁移方案并逐一判定即可。

一次迁移由下标 $i$ 与目标坐标 $x$ 共同确定：

- $i$ 只能取内部点，即 $2 \le i \le n-1$（代码中为 0-based 的 $1 \le i \le n-2$）。
- 端点不动，故要求 $a_1 < x < a_n$，候选为 $[a_1+1,\ a_n-1]$ 中的所有整数。
- $x$ 不能与移动前任何一个点的坐标相同（包含 $a_i$ 自身）。用一个布尔数组标记所有出现过的坐标，即可 $O(1)$ 判断某个 $x$ 是否合法。

对每个候选 $(i, x)$，构造移动后的坐标序列：把第 $i$ 位换成 $x$，其余位置保持原坐标，然后排序并检查相邻两个坐标之差是否都不超过 $k$。若全部满足，就计入答案。

枚举总量为「内部下标数」乘「候选坐标数」，不超过 $58 \times 1000$，每组判定为 $O(n \log n)$，足够轻松通过。

## 复杂度

时间 $O(n \cdot C \cdot n \log n)$，其中 $C = a_n - a_1 \le 1000$ 为候选坐标个数；空间 $O(n + C)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let maxCoord = 2001
    let present = Array<Bool>(maxCoord, { _ => false })
    for (v in a) {
        present[v] = true
    }

    var ans = 0
    var i = 1
    while (i < n - 1) {
        var x = a[0] + 1
        while (x < a[n - 1]) {
            if (!present[x]) {
                let b = Array<Int64>(n, { _ => 0 })
                var idx = 0
                var j = 0
                while (j < n) {
                    if (j == i) {
                        b[idx] = x
                    } else {
                        b[idx] = a[j]
                    }
                    idx += 1
                    j += 1
                }
                sort(b)
                var ok = true
                var t = 1
                while (t < n) {
                    if (b[t] - b[t - 1] > k) {
                        ok = false
                        break
                    }
                    t += 1
                }
                if (ok) {
                    ans += 1
                }
            }
            x += 1
        }
        i += 1
    }
    println(ans)
}
```
