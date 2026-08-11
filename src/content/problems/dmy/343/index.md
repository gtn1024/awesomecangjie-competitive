---
oj: dmy
pid: '343'
title: '[R55C]简单数论题'
difficulty: 提高
tags:
  - 数论
  - 质因数分解
  - 筛法
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 200$，$1 \le q \le 10^5$，$2 \le a_i \le 10^5$，$1 \le k \le 10^5$，且 $a_i$ 均为质数。

## 思路

「好数」的定义是 $x = a_1^{b_1} \times a_2^{b_2} \times \cdots \times a_n^{b_n}$（$b_i \ge 0$）。这等价于：**$x$ 的质因数分解中只可能出现 $a$ 集合里的质数**。特别地，$x = 1$（所有 $b_i = 0$）也是好数。

由于 $k \le 10^5$，可以把所有可能的 $k$ 一次性预处理出来。设 `good[x]` 表示 $x$ 是否为好数，则：

- `good[1] = true`（空积）。
- 若 `good[x]` 为真，则对 $a$ 中任意质数 $p$，只要 $x \cdot p \le 10^5$，就有 `good[x · p] = true`。

于是从 $x = 1$ 开始正向递推：从小到大扫描 $x$，对每个好数 $x$，把 $x \cdot p$（$p \in a$ 且不越界）标记为好数。由于扫描顺序递增，被标记的 $x \cdot p$ 一定大于 $x$，在其后被处理时已经就绪，递推正确。

询问时只需 $O(1)$ 查表。注意 $a$ 序列可能含重复质数，先去重以减少常数。

## 复杂度

- 时间：预处理 $O(V \cdot |P|)$，其中 $V = 10^5$，$|P|$ 为去重后 $a$ 的质数个数（至多 $200$），约 $2 \times 10^7$；询问 $O(q)$。总计远小于 1 秒。
- 空间：$O(V)$，存放 `good` 标记数组。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let q = head[1]
    let raw = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 去重得到 a 中的不同质数集合
    let pset = HashSet<Int64>()
    for (p in raw) {
        pset.add(p)
    }
    let m = pset.size
    var primes = Array<Int64>(m, { _ => 0 })
    var idx = 0
    for (p in pset) {
        primes[idx] = p
        idx = idx + 1
    }

    let LIMIT = 100000
    // good[x] = true 表示 x 是好数（x 仅由 a 中质数的非负次幂组成）
    var good = Array<Bool>(LIMIT + 1, { _ => false })
    good[1] = true
    // 前向递推：若 x 是好数，则 x*p（p 属于 a 的质数集合）也是好数
    for (x in 1..LIMIT + 1) {
        if (good[x]) {
            for (i in 0..m) {
                let p = primes[i]
                if (p > Int64(LIMIT)) {
                    continue
                }
                let nxt = x * p
                if (nxt <= Int64(LIMIT)) {
                    good[nxt] = true
                }
            }
        }
    }

    // 处理查询
    var out = StringBuilder()
    for (_ in 0..q) {
        let k = Int64.parse(reader.readln().getOrThrow())
        if (k >= 1 && k <= Int64(LIMIT) && good[k]) {
            out.append("YES\n")
        } else {
            out.append("NO\n")
        }
    }
    print(out.toString())
    return 0
}
```
