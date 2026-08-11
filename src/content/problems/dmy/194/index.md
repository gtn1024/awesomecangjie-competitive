---
oj: dmy
pid: '194'
title: '[R32C]奇偶更新'
difficulty: 提高
tags:
  - 模拟
  - 懒标记
timeLimit: 1s
memoryLimit: 512m
---

> $1 \le n, Q \le 2 \times 10^5$，$1 \le A_i, x \le 10^9$。

## 思路

朴素模拟每次遍历整个数组是 $O(nQ)$，会超时。突破口在于观察「奇偶性」的变化规律。

关键性质：操作只分两类，且只看每个元素**当前**的奇偶性。考虑某个 $x$ 为**奇数**时会发生什么：

- 操作 $1\ x$（给当前奇数加 $x$）：奇数加奇数变偶数，偶数不变。因此执行后数组里**全是偶数**。
- 操作 $2\ x$（给当前偶数加 $x$）：偶数加奇数变奇数，奇数不变。因此执行后数组里**全是奇数**。

也就是说，**只要某次操作的 $x$ 是奇数，数组就立刻坍缩成单一奇偶性**。从此以后所有元素奇偶性一致，后续操作要么作用在所有元素上（类型与当前奇偶性匹配），要么一个都不作用（不匹配），都可以 $O(1)$ 处理。

据此分两个阶段：

- **阶段一（混合阶段）**：从开始到第一次遇到奇数 $x$ 之前。此时数组里既有奇数又有偶数，但由于每次 $x$ 都是偶数，每个元素的奇偶性**始终不变**。只需维护两个累加器 `addOdd`、`addEven`：当前是奇数的元素最终要补上 `addOdd`，当前是偶数的元素补上 `addEven`。每次操作按类型把 $x$ 累加到对应累加器即可，$O(1)$。

- **阶段二（统一阶段）**：一旦遇到奇数 $x$，先把阶段一的累加器结算到每个元素上（一次性 $O(n)$），并把元素按此时新值重新计算，得到统一奇偶性。之后维护一个 `uniAdd` 累加量与基准奇偶性 `uniParity`：每次操作时先算出当前真实奇偶性 `(uniParity + uniAdd) mod 2`，若与操作类型匹配则 `uniAdd += x`，否则不操作。由于真实奇偶性可以直接由 `uniParity + uniAdd` 推出，元素奇偶性是否翻转被自动包含在内，无需显式维护。

整个过程中 $O(n)$ 的结算**最多发生一次**（进入阶段二时），其余每步都是 $O(1)$。

## 复杂度

时间 $O(n + Q)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let q = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 阶段 1：数组中既有奇数又有偶数。
    // 此时加偶数 x 不改变奇偶性：奇桶加 addOdd，偶桶加 addEven。
    var addOdd = Int64(0)
    var addEven = Int64(0)
    var unified = false   // 是否已进入「单一奇偶性」阶段
    var uniAdd = Int64(0) // 单一奇偶性阶段累计加量
    var uniParity = 0     // 单一奇偶性阶段：统一后的奇偶性，1=奇 0=偶（基于真实值）

    var i = 0
    while (i < q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let op = line[0]
        let x = line[1]
        if (unified) {
            // uniParity 是统一阶段开始时（即上一条操作处理完）的真实奇偶性
            // 这一条 x 后的真实奇偶性 = (uniParity + uniAdd) 奇偶
            let curParity = ((uniParity + uniAdd) % Int64(2) + Int64(2)) % Int64(2)
            if (op == Int64(1)) {
                // 给当前奇数加 x
                if (curParity == Int64(1)) {
                    uniAdd += x
                }
                // 否则无当前奇数，不操作
            } else {
                // op == 2：给当前偶数加 x
                if (curParity == Int64(0)) {
                    uniAdd += x
                }
            }
        } else {
            if (x % Int64(2) == Int64(0)) {
                // 偶数 x：奇偶性不变
                if (op == Int64(1)) {
                    addOdd += x
                } else {
                    addEven += x
                }
            } else {
                // 奇数 x：奇偶性会完全翻转成单一奇偶性
                // 先结算旧累加器到每个元素（用新值判断后续）
                if (op == Int64(1)) {
                    // 给当前奇数加 x：奇数变偶数，偶数不变 -> 全是偶数
                    for (k in 0..n) {
                        let base = a[k]
                        let cur = if (base % Int64(2) != Int64(0)) { base + addOdd + x } else { base + addEven }
                        a[k] = cur
                    }
                    addOdd = Int64(0)
                    addEven = Int64(0)
                    unified = true
                    uniAdd = Int64(0)
                    uniParity = 0 // 全是偶数
                } else {
                    // op == 2：给当前偶数加 x：偶数变奇数，奇数不变 -> 全是奇数
                    for (k in 0..n) {
                        let base = a[k]
                        let cur = if (base % Int64(2) == Int64(0)) { base + addEven + x } else { base + addOdd }
                        a[k] = cur
                    }
                    addOdd = Int64(0)
                    addEven = Int64(0)
                    unified = true
                    uniAdd = Int64(0)
                    uniParity = 1 // 全是奇数
                }
            }
        }
        i++
    }

    // 输出
    if (unified) {
        // 所有元素值 = a[k] + uniAdd
        let sb = StringBuilder()
        for (k in 0..n) {
            if (k > 0) {
                sb.append(" ")
            }
            sb.append(a[k] + uniAdd)
        }
        println(sb.toString())
    } else {
        // 两桶分别结算
        let sb = StringBuilder()
        for (k in 0..n) {
            if (k > 0) {
                sb.append(" ")
            }
            let v = if (a[k] % Int64(2) != Int64(0)) { a[k] + addOdd } else { a[k] + addEven }
            sb.append(v)
        }
        println(sb.toString())
    }
}
```
