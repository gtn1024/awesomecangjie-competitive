---
oj: dmy
pid: '395'
title: '[R63E] 这是一个01串题2'
difficulty: 普及+/提高
tags:
  - 贪心
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, Q \le 2 \times 10^5$，$0 \le k_i \le n$。

## 思路

把字符 `0` 翻成 `1` 只会让字典序变大，且对消除相邻的 `1` 毫无帮助，因此最优方案的每次翻转一定把某个 `1` 翻成 `0`；而把 `1` 翻成 `0` 永远不会破坏「不存在相邻 `1`」的性质。问题等价于：从 $s$ 中选出至多 $k$ 个位置（必须是 `1`）翻成 `0`，使剩余字符串无相邻 `1`，且字典序最小。

考虑一段连续的 `1`，设其长度为 $L$，至少要翻 $\lfloor L/2 \rfloor$ 个位置才能断开所有相邻对。在最小翻转过数下，为保证字典序最小，翻法唯一确定：

- $L$ 为偶数：翻段内奇数偏移位，如 $1111 \to 0101$；
- $L$ 为奇数：翻段内偶数偏移位，如 $11111 \to 10101$。

各段互不影响，记最少操作总数为 $\text{need} = \sum \lfloor L/2 \rfloor$。若 $k < \text{need}$，无法得到合法串，输出 `-1`。

当 $k \ge \text{need}$ 时，先做这 $\text{need}$ 次翻转得到串 $t^*$。多余的操作次数越多，字典序越小，因此每次多余操作都把 $t^*$ 中**最靠左的 `1`** 翻成 `0`。设多余操作次数为 $e = k - \text{need}$，若 $e$ 不小于 $t^*$ 中 `1` 的总数 $m$，则 $t_k$ 为全 `0` 串，任何询问答案都是 `0`；否则记 $p$ 为 $t^*$ 中从左往右第 $e$ 个 `1` 的位置（$e = 0$ 时令 $p = 0$），那么 $t_k$ 中位置 $\le p$ 处全部为 `0`，位置 $> p$ 处与 $t^*$ 完全一致。

因此询问 $(k, l, r)$ 的答案就是 $t^*$ 的 `1` 在区间 $[\max(l, p+1), r]$ 中的个数，用 $t^*$ 的前缀和 $O(1)$ 计算即可；若 $r \le p$ 则答案为 `0`。

## 复杂度

预处理扫描一次 $O(n)$，每次询问 $O(1)$，总复杂度 $O(n + Q)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

func solve(reader: ConsoleReader): Unit {
    let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nq[0]
    let qnum = nq[1]
    let s = reader.readln().getOrThrow()
    let chars = s.toRuneArray()
    let isOne = Array<Int64>(n, { _ => 0 })
    let kept = ArrayList<Int64>()
    var need: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        if (chars[i] == r'1') {
            let st = i
            while (i < n && chars[i] == r'1') {
                i += 1
            }
            let en = i - 1
            let len = en - st + 1
            if (len % 2 == 0) {
                var j = st
                while (j <= en) {
                    need += 1
                    j += 2
                }
                j = st + 1
                while (j <= en) {
                    isOne[j] = 1
                    kept.add(j + 1)
                    j += 2
                }
            } else {
                var j = st + 1
                while (j <= en) {
                    need += 1
                    j += 2
                }
                j = st
                while (j <= en) {
                    isOne[j] = 1
                    kept.add(j + 1)
                    j += 2
                }
            }
        } else {
            i += 1
        }
    }
    let pref = Array<Int64>(n + 1, { _ => 0 })
    var acc: Int64 = 0
    var j: Int64 = 1
    while (j <= n) {
        acc += isOne[j - 1]
        pref[j] = acc
        j += 1
    }
    let m = kept.size
    var q: Int64 = 0
    while (q < qnum) {
        let qs = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let k = qs[0]
        let l = qs[1]
        let r = qs[2]
        if (k < need) {
            println("-1")
        } else {
            let e = k - need
            if (e >= m) {
                println("0")
            } else {
                var p: Int64 = 0
                if (e > 0) {
                    p = kept.get(e - 1).getOrThrow()
                }
                if (r <= p) {
                    println("0")
                } else {
                    var left = l - 1
                    if (p > left) {
                        left = p
                    }
                    let ans = pref[r] - pref[left]
                    println(ans)
                }
            }
        }
        q += 1
    }
}

main() {
    let reader = getStdIn()
    solve(reader)
}
```

</details>
