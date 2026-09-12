---
oj: dmy
pid: '333'
title: '[R53F] LCM'
difficulty: 提高
tags:
  - 数论
  - 离线查询
  - 线段树
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 2 \times 10^5$，$1 \le a_i \le 10^6$。

## 思路

设区间最小公倍数为 $M$。对于质数 $p$，记 $M$ 的质因数分解中 $p$ 的指数为 $E_p$。整数 $x$ 不能整除 $M$，当且仅当 $x$ 含有某个质因子 $p$，且 $p$ 在 $x$ 中的指数大于 $E_p$。

因此，不能整除 $M$ 的最小正整数一定是某个质数幂，并且

$$
f(M)+1=\min_p p^{E_p+1}。
$$

换一个角度看，对于质数幂 $d=p^k$，有

$$
d\mid \operatorname{lcm}(a_l,\ldots,a_r)
\iff
\text{区间内存在某个 }a_i\text{ 满足 }d\mid a_i。
$$

于是问题变为：按数值从小到大枚举质数幂，找到第一个没有整除区间中任何元素的质数幂 $d$，答案就是 $d-1$。

将询问按右端点 $r$ 分组，随后从左到右扫描数组。对每个不超过 $10^6$ 的质数幂 $d$，维护 `last[d]`，表示当前扫描位置之前，最近一个满足 $d\mid a_i$ 的位置。处理到位置 $r$ 时，质因数分解 $a_r$；若其中包含 $p^e$，就把 $p,p^2,\ldots,p^e$ 对应的最近位置全部更新为 $r$。

对于询问 $[l,r]$，质数幂 $d$ 在区间内出现过，当且仅当 `last[d] >= l`。把所有质数幂按数值升序放在线段树叶子上，每个结点维护区间内 `last` 的最小值。查询时从根开始：若左儿子的最小值小于 $l$，答案在左边；否则进入右儿子。这样可以在 $O(\log P)$ 时间内找到第一个 `last[d] < l` 的质数幂，其中 $P$ 是候选质数幂的数量。

所有 $a_i$ 都不超过 $10^6$，所以大于 $10^6$ 的质数幂不可能整除任何 $a_i$。代码额外加入最小的此类质数幂 $1000003$ 作为哨兵，保证每次查询都能找到答案。

预处理最小质因子需要 $O(A\log\log A)$ 时间，其中 $A=10^6$。每个 $a_i$ 产生 $O(\log A)$ 次线段树更新，每次询问进行一次线段树二分。总时间复杂度为 $O(A\log\log A+(n\log A+q)\log P)$，空间复杂度为 $O(A+n+q)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

func update(tree: Array<Int64>, size: Int64, pos: Int64, value: Int64): Unit {
    var node = size + pos
    tree[node] = value
    node /= 2
    while (node > 0) {
        let left = tree[node * 2]
        let right = tree[node * 2 + 1]
        tree[node] = if (left < right) { left } else { right }
        node /= 2
    }
}

func firstBefore(tree: Array<Int64>, size: Int64, leftBound: Int64): Int64 {
    var node: Int64 = 1
    while (node < size) {
        if (tree[node * 2] < leftBound) {
            node *= 2
        } else {
            node = node * 2 + 1
        }
    }
    return node - size
}

main() {
    let reader = Console.stdIn
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = firstLine[0]
    let q = firstLine[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let limit: Int64 = 1000000
    let smallestPrime = Array<Int64>(limit + 1, { _ => 0 })
    var i: Int64 = 2
    while (i <= limit) {
        if (smallestPrime[i] == 0) {
            smallestPrime[i] = i
            if (i <= limit / i) {
                var multiple = i * i
                while (multiple <= limit) {
                    if (smallestPrime[multiple] == 0) {
                        smallestPrime[multiple] = i
                    }
                    multiple += i
                }
            }
        }
        i += 1
    }

    let rankByValue = Array<Int64>(limit + 1, { _ => -1 })
    var prime: Int64 = 2
    while (prime <= limit) {
        if (smallestPrime[prime] == prime) {
            var power = prime
            while (power <= limit) {
                rankByValue[power] = 0
                if (power > limit / prime) {
                    break
                }
                power *= prime
            }
        }
        prime += 1
    }

    var powerCount: Int64 = 0
    i = 2
    while (i <= limit) {
        if (rankByValue[i] >= 0) {
            powerCount += 1
        }
        i += 1
    }
    let totalPowers = powerCount + 1
    let powerValues = Array<Int64>(totalPowers, { _ => 0 })
    var rank: Int64 = 0
    i = 2
    while (i <= limit) {
        if (rankByValue[i] >= 0) {
            rankByValue[i] = rank
            powerValues[rank] = i
            rank += 1
        }
        i += 1
    }
    powerValues[powerCount] = 1000003

    let queryLeft = Array<Int64>(q, { _ => 0 })
    let nextQuery = Array<Int64>(q, { _ => -1 })
    let firstQuery = Array<Int64>(n + 1, { _ => -1 })
    let answers = Array<Int64>(q, { _ => 0 })
    var queryId: Int64 = 0
    while (queryId < q) {
        let query = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let left = query[0]
        let right = query[1]
        queryLeft[queryId] = left
        nextQuery[queryId] = firstQuery[right]
        firstQuery[right] = queryId
        queryId += 1
    }

    var treeSize: Int64 = 1
    while (treeSize < totalPowers) {
        treeSize *= 2
    }
    let infinity = n + 1
    let tree = Array<Int64>(treeSize * 2, { _ => infinity })
    i = 0
    while (i < totalPowers) {
        tree[treeSize + i] = 0
        i += 1
    }
    var node = treeSize - 1
    while (node > 0) {
        let left = tree[node * 2]
        let right = tree[node * 2 + 1]
        tree[node] = if (left < right) { left } else { right }
        node -= 1
    }

    var right: Int64 = 1
    while (right <= n) {
        var value = a[right - 1]
        while (value > 1) {
            let factor = smallestPrime[value]
            var factorPower = factor
            while (value % factor == 0) {
                update(tree, treeSize, rankByValue[factorPower], right)
                value /= factor
                factorPower *= factor
            }
        }

        queryId = firstQuery[right]
        while (queryId >= 0) {
            let missingRank = firstBefore(tree, treeSize, queryLeft[queryId])
            answers[queryId] = powerValues[missingRank] - 1
            queryId = nextQuery[queryId]
        }
        right += 1
    }

    i = 0
    while (i < q) {
        println(answers[i])
        i += 1
    }
}
```
