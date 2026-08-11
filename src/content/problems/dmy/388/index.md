---
oj: dmy
pid: '388'
title: '[R62D] 好子串'
difficulty: 普及/提高-
tags:
  - 双指针
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le k \le n$，字符串仅含 `A`、`B`、`C`。

## 思路

一个连续子串通过至多 $k$ 次修改变成全相同字符，最终字符一定取子串中出现次数最多的字符，因此「好子串」等价于

$$
\mathit{len} - \mathit{maxcnt} \le k
$$

其中 $\mathit{len}$ 为子串长度，$\mathit{maxcnt}$ 为子串中 `A`、`B`、`C` 三者出现次数的最大值。

暴力枚举所有子串是 $O(n^2)$，无法通过。注意到关键性质：向右扩展右端点时，$\mathit{len} - \mathit{maxcnt}$ 的值要么不变（新字符是出现最多的字符），要么增加 $1$（新字符不是出现最多的字符），即 **单调不减**。因此对固定的左端点 $l$，存在一个最大右端点 $r$，使得 $[l, r_0]$（$l \le r_0 \le r$）全部是好子串；且当 $l$ 右移时，$r$ 只会单调右移，不会回退。

于是用双指针（滑动窗口）维护窗口内三个字符的出现次数：

- 尝试把 $s[r]$ 加入窗口，若窗口的 $\mathit{len} - \mathit{maxcnt} > k$ 则撤销加入并停止扩展，否则 $r$ 右移；
- 当前 $l$ 对答案的贡献为 $r - l + 1$；
- 把 $s[l]$ 移出窗口，$l$ 右移。

每个字符最多进入、离开窗口各一次，总复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let k = line1[1]
    let s = reader.readln().getOrThrow()
    var cnt = Array<Int64>(3, { _ => 0 })
    var l: Int64 = 0
    var r: Int64 = 0
    var ans: Int64 = 0
    while (l < n) {
        while (r < n) {
            let c = Int64(s[r]) - 65
            cnt[c] += 1
            var maxc = cnt[0]
            if (cnt[1] > maxc) {
                maxc = cnt[1]
            }
            if (cnt[2] > maxc) {
                maxc = cnt[2]
            }
            if ((r - l + 1) - maxc > k) {
                cnt[c] -= 1
                break
            }
            r += 1
        }
        ans += r - l
        cnt[Int64(s[l]) - 65] -= 1
        l += 1
    }
    println(ans)
}
```
