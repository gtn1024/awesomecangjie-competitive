---
oj: dmy
pid: '149'
title: '[R25B]Ferrers 图'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，每行长度 $1 \le |s_i| \le 100$。

## 思路

按照定义逐步判定并构造即可，本质是 **模拟**。

先判断给定点阵是否是 Ferrers 图，需要同时满足：

- 每行都只由 `#` 组成；
- 相邻两行长度满足非递增，即 $|s_i| \ge |s_{i+1}|$。

任意一条不满足就直接输出 `No`。

若判定通过，则构造共轭图。共轭图的第 $k$ 行长度等于原图中长度 **不小** 于 $k$ 的行数。由于原图各行长度已经非递增，只需对每个长度值统计出现次数，从大到小做一次后缀和，就能 $O(\text{maxLen})$ 得到每个 $k$ 对应的共轭行长度，自然也满足非递增。

## 复杂度

时间 $O(n + \text{maxLen})$，空间 $O(\text{maxLen})$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let lens = Array<Int64>(n, { _ => 0 })
    var maxLen: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        let line = reader.readln().getOrThrow()
        // 校验：整行必须都是 #
        var allHash = true
        let hashByte = UInt8(35)
        for (ch in line) {
            if (ch != hashByte) {
                allHash = false
                break
            }
        }
        if (!allHash) {
            println("No")
            return 0
        }
        let L = line.size
        lens[i] = L
        if (L > maxLen) {
            maxLen = L
        }
        i += 1
    }

    // 检查非递增
    var j: Int64 = 1
    while (j < n) {
        if (lens[j] > lens[j - 1]) {
            println("No")
            return 0
        }
        j += 1
    }

    // 共轭：第 k 行（1-indexed, k=1..maxLen）长度 = 满足 lens[i] >= k 的行数
    // 因 lens 非递增，可用 cnt[l] 表示长度恰为 l 的行数，从大到小累加
    // count[k] = #{i : lens[i] >= k}
    let cnt = Array<Int64>(maxLen + 2, { _ => 0 })
    var t: Int64 = 0
    while (t < n) {
        cnt[lens[t]] += 1
        t += 1
    }
    // suffix sum
    var suffix = Array<Int64>(maxLen + 2, { _ => 0 })
    var k = maxLen
    while (k >= 1) {
        suffix[k] = suffix[k + 1] + cnt[k]
        k -= 1
    }

    println("Yes")
    var m: Int64 = 1
    while (m <= maxLen) {
        var c = suffix[m]
        while (c > 0) {
            print('#')
            c -= 1
        }
        println()
        m += 1
    }
    return 0
}
```
