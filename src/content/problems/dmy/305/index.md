---
oj: dmy
pid: '305'
title: '[R49C]调整亮度'
difficulty: 提高
tags:
  - 差分
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, Q \le 2 \times 10^5$，$2 \le h_i \le 9$，$1 \le l \le r \le n$。

## 思路

每盏灯的挡位变化只和它被拨动的总次数有关。由于第 $i$ 盏灯有 $h_i$ 个挡位，从 $0$ 出发每拨动一次挡位加 $1$，到 $h_i - 1$ 后回到 $0$，等价于一个模 $h_i$ 的计数器。因此最终挡位就是该灯被拨动次数对 $h_i$ 取模。

关键在于快速求出每盏灯被覆盖的次数。每次操作给一个区间 $[l, r]$，等价于把 $[l, r]$ 内每盏灯的计数都加 $1$，这是典型的 **区间加** 问题。用差分数组：对每个 $[l, r]$，令 `diff[l] += 1`、`diff[r+1] -= 1`，最后做一次前缀和即可还原出每盏灯被拨动的次数 $\text{cnt}[i]$。最终答案为 $\text{cnt}[i] \bmod h_i$。

## 复杂度

时间 $O(n + Q)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = firstLine[0]
    let q = firstLine[1]
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let diff = Array<Int64>(n + 2, { _ => 0 })
    var i = 0
    while (i < q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = line[0]
        let r = line[1]
        diff[l] = diff[l] + 1
        diff[r + 1] = diff[r + 1] - 1
        i++
    }
    var cur = Int64(0)
    var j = 1
    while (j <= n) {
        cur = cur + diff[j]
        if (j > 1) {
            print(" ")
        }
        print(cur % h[j - 1])
        j++
    }
    println()
}
```

</details>
