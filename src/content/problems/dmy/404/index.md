---
oj: dmy
pid: '404'
title: '[R65B] 卡片'
difficulty: 普及-
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 1000$，$1 \le a_i \le 1000$。

## 思路

从每个起点 $s$ 出发，检查连续 $k$ 张卡片（环形取模）是否为 $1 \sim k$ 的一个排列：用标记数组记录 $1 \sim k$ 中各数是否出现过，一旦遇到越界值（$< 1$ 或 $> k$）或重复值就失败。按 $s$ 从小到大找，第一个成功的就是答案。

复杂度：时间 $O(nk)$，空间 $O(k)$。$n, k \le 1000$，$10^6$ 次检查完全可行。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = -1
    for (s in 0..n) {
        var seen = Array<Bool>(k + 1, { _ => false })
        var ok = true
        for (t in 0..k) {
            let v = a[(s + t) % n]
            if (v < 1 || v > k || seen[v]) {
                ok = false
                break
            }
            seen[v] = true
        }
        if (ok) {
            ans = s + 1
            break
        }
    }
    println(ans)
}
```

</details>

要点：

- 环形取卡片用 `(s + t) % n` 处理，第 $n$ 张的下一张自然回到第 1 张。
- 检查到 $k$ 个互不相同且都在 $[1, k]$ 内的数，就必然是 $1 \sim k$ 的一个排列。
- 找到第一个合法起点即 `break`，天然满足「输出最小的 $s$」。
