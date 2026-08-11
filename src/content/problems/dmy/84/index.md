---
oj: dmy
pid: '84'
title: '[R14F] 战队选人2'
difficulty: 提高
tags:
  - 贪心
  - 对顶堆
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 10^6$，$1 \le p_i \le 10^9$，$1 \le k_1, k_2 \le m$。

## 思路

这是「战队选人」的另一个版本：不再是数方案数，而是要在 $n$ 名同学中选出 $m$ 名，在满足「至少 $k_1$ 名语文好、至少 $k_2$ 名数学好」的前提下让总分最大。

先按两个能力区间把同学分成四类：

- $A$：语文数学都好（在 $[l_1, r_1]$ 且在 $[l_2, r_2]$）；
- $B$：只有语文好；
- $C$：只有数学好；
- $D$：都不好。

每类内部按分数从大到小排序，并做前缀和 $sA, sB, sC$。若要选某类前若干名，用前缀和 $O(1)$ 得到分数。

枚举选了 $nA$ 名 $A$ 类同学（$nA$ 从 $0$ 到 $\min(|A|, m)$）。一旦 $nA$ 确定：

- 若 $nA < k_1$，则 $B$ 类必须再选分数最大的 $k_1 - nA$ 名；
- 若 $nA < k_2$，则 $C$ 类必须再选分数最大的 $k_2 - nA$ 名。

记强制选出的数量为 $f_B = \max(k_1 - nA, 0)$、$f_C = \max(k_2 - nA, 0)$。可行性要求 $f_B \le |B|$、$f_C \le |C|$ 且 $nA + f_B + f_C \le m$。剩下的 $R = m - nA - f_B - f_C$ 名，要从**剩余的**同学（$B$ 类第 $f_B$ 名之后、$C$ 类第 $f_C$ 名之后、全部 $D$ 类）里挑分数最大的 $R$ 名。

暴力对每个 $nA$ 都重新选一次复杂度是 $O(n^2)$。注意到 $nA$ 递增时 $f_B, f_C$ 单调不增，所以可选的「剩余同学」池只增不减，而 $R$ 也在变化。用**对顶堆**维护这个动态池：

- 小根堆 $qL$ 存当前池中分数最大的 $R$ 个，并维护其中元素之和 $sQ$；
- 大根堆 $qR$ 存池中其余元素。

当池里新增一个元素 $x$ 时：若 $qL$ 还没满（$|qL| < R$）直接加入；否则若 $x$ 大于 $qL$ 堆顶（$qL$ 中最小值），就把堆顶踢到 $qR$、$x$ 进 $qL$，并修正 $sQ$；否则 $x$ 直接进 $qR$。当 $R$ 变化时，通过在 $qL$ 与 $qR$ 之间搬运元素把 $|qL|$ 调成新的 $R$。

由于 $f_B, f_C$ 只减不增，被「释放」回池里的 $B, C$ 元素按分数从大到小的顺序加入；整个枚举过程每个元素至多进出堆常数次，总时间 $O(n \log n)$。

最终答案为所有可行 $nA$ 下：

$$sA[nA] + sB[f_B] + sC[f_C] + sQ$$

的最大值；若没有任何可行的 $nA$，输出 $-1$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*
import std.sort.*

// 小根堆：堆顶是堆内最小的分数
class MinHeap {
    var h: Array<Int64>
    var size: Int64 = 0
    public init(cap: Int64) {
        h = Array<Int64>(cap, { _ => 0 })
    }
    func push(x: Int64): Unit {
        var i = size
        size += 1
        var xx = x
        while (i > 0) {
            let p = (i - 1) / 2
            if (h[p] <= xx) {
                break
            }
            h[i] = h[p]
            i = p
        }
        h[i] = xx
    }
    func top(): Int64 {
        return h[0]
    }
    func pop(): Int64 {
        let rd = h[0]
        size -= 1
        if (size > 0) {
            let ld = h[size]
            var i: Int64 = 0
            while (true) {
                let l = 2 * i + 1
                if (l >= size) {
                    break
                }
                let r = l + 1
                var m = l
                if (r < size && h[r] < h[l]) {
                    m = r
                }
                if (h[m] >= ld) {
                    break
                }
                h[i] = h[m]
                i = m
            }
            h[i] = ld
        }
        return rd
    }
}

// 大根堆：堆顶是堆内最大的分数（用负值实现）
class MaxHeap {
    var h: Array<Int64>
    var size: Int64 = 0
    public init(cap: Int64) {
        h = Array<Int64>(cap, { _ => 0 })
    }
    func push(x: Int64): Unit {
        var i = size
        size += 1
        var xx = -x
        while (i > 0) {
            let p = (i - 1) / 2
            if (h[p] <= xx) {
                break
            }
            h[i] = h[p]
            i = p
        }
        h[i] = xx
    }
    func pop(): Int64 {
        let rd = -h[0]
        size -= 1
        if (size > 0) {
            let ld = h[size]
            var i: Int64 = 0
            while (true) {
                let l = 2 * i + 1
                if (l >= size) {
                    break
                }
                let r = l + 1
                var m = l
                if (r < size && h[r] < h[l]) {
                    m = r
                }
                if (h[m] >= ld) {
                    break
                }
                h[i] = h[m]
                i = m
            }
            h[i] = ld
        }
        return rd
    }
}

// 候选池：维护当前集合中分数最大的 targetR 个（放在 qL 小根堆，其和为 sumL），
// 其余放在 qR 大根堆。targetR 可动态调整（仅支持增、减、维持）。
class Pool {
    var qL: MinHeap
    var qR: MaxHeap
    var targetR: Int64 = 0
    var sumL: Int64 = 0
    public init(cap: Int64) {
        qL = MinHeap(cap)
        qR = MaxHeap(cap)
    }
    var total: Int64 = 0
    // 加入一个候选分数
    func insert(x: Int64): Unit {
        total += 1
        if (qL.size < targetR) {
            qL.push(x)
            sumL += x
        } else {
            if (targetR > 0 && qL.top() < x) {
                let out = qL.pop()
                sumL -= out
                qL.push(x)
                sumL += x
                qR.push(out)
            } else {
                qR.push(x)
            }
        }
    }
    // 调整目标大小为 newTarget（newTarget 可能为负，表示当前不可行，池清空）
    func resize(newTarget: Int64): Unit {
        var nt = newTarget
        if (nt < 0) {
            nt = 0
        }
        targetR = nt
        while (qL.size < targetR && qR.size > 0) {
            let v = qR.pop()
            qL.push(v)
            sumL += v
        }
        while (qL.size > targetR && qL.size > 0) {
            let v = qL.pop()
            sumL -= v
            qR.push(v)
        }
    }
}

main(): Int64 {
    let reader = getStdIn()
    let n = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })[0]
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x => Int64.parse(x) })
    let lr1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x => Int64.parse(x) })
    let l1 = lr1[0]
    let r1 = lr1[1]
    let l2 = lr1[2]
    let r2 = lr1[3]
    let mmk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x => Int64.parse(x) })
    let m = mmk[0]
    let k1 = mmk[1]
    let k2 = mmk[2]

    // 分类（编号 1..n，下标 0..n-1）
    let listA = ArrayList<Int64>()
    let listB = ArrayList<Int64>()
    let listC = ArrayList<Int64>()
    let listD = ArrayList<Int64>()
    var i: Int64 = 0
    while (i < n) {
        let idx = i + 1
        let isChn = (idx >= l1 && idx <= r1)
        let isMath = (idx >= l2 && idx <= r2)
        if (isChn && isMath) {
            listA.add(p[i])
        } else if (isChn) {
            listB.add(p[i])
        } else if (isMath) {
            listC.add(p[i])
        } else {
            listD.add(p[i])
        }
        i += 1
    }
    var arrA = Array<Int64>(listA.size, { j => listA[j] })
    var arrB = Array<Int64>(listB.size, { j => listB[j] })
    var arrC = Array<Int64>(listC.size, { j => listC[j] })
    var arrD = Array<Int64>(listD.size, { j => listD[j] })
    sort(arrA, descending: true)
    sort(arrB, descending: true)
    sort(arrC, descending: true)
    sort(arrD, descending: true)

    // 前缀和（分数从大到小）
    let sA = Array<Int64>(arrA.size + 1, { _ => 0 })
    var j: Int64 = 0
    while (j < arrA.size) {
        sA[j + 1] = sA[j] + arrA[j]
        j += 1
    }
    let sB = Array<Int64>(arrB.size + 1, { _ => 0 })
    j = 0
    while (j < arrB.size) {
        sB[j + 1] = sB[j] + arrB[j]
        j += 1
    }
    let sC = Array<Int64>(arrC.size + 1, { _ => 0 })
    j = 0
    while (j < arrC.size) {
        sC[j + 1] = sC[j] + arrC[j]
        j += 1
    }

    let nA = arrA.size
    let nB = arrB.size
    let nC = arrC.size
    let nD = arrD.size

    var ans: Int64 = -1

    // 候选池：当前可选的剩余学生（D 全部 + B 非强制 + C 非强制），维护其中分数最大的 targetR 个。
    let pool = Pool(nD + nB + nC + 4)

    // 初始 nAsel = 0：forcedB = k1, forcedC = k2。
    // lastForcedB/lastForcedC 记录「当前被强制占用、不可放入池」的数量。
    var lastForcedB = if (k1 < nB) { k1 } else { nB }
    var lastForcedC = if (k2 < nC) { k2 } else { nC }
    // 初始 targetR = m - 0 - lastForcedB - lastForcedC（可能为负，但 resize 会处理）
    var targetR0 = m - lastForcedB - lastForcedC
    pool.resize(targetR0)
    var t: Int64 = lastForcedB
    while (t < nB) {
        pool.insert(arrB[t])
        t += 1
    }
    t = lastForcedC
    while (t < nC) {
        pool.insert(arrC[t])
        t += 1
    }
    t = 0
    while (t < nD) {
        pool.insert(arrD[t])
        t += 1
    }

    // nAsel 从 0 枚举到 min(nA, m)
    var nAsel: Int64 = 0
    while (nAsel <= nA && nAsel <= m) {
        let needB = k1 - nAsel
        let needC = k2 - nAsel
        let forcedB = if (needB > 0) { needB } else { 0 }
        let forcedC = if (needC > 0) { needC } else { 0 }
        // 释放因 forced 减小而变为可选的元素
        // newPoolForcedB = min(forcedB, nB)；如果小于 lastForcedB，释放 B[newPoolForcedB..lastForcedB)
        let newPoolForcedB = if (forcedB < nB) { forcedB } else { nB }
        while (newPoolForcedB < lastForcedB) {
            lastForcedB -= 1
            pool.insert(arrB[lastForcedB])
        }
        let newPoolForcedC = if (forcedC < nC) { forcedC } else { nC }
        while (newPoolForcedC < lastForcedC) {
            lastForcedC -= 1
            pool.insert(arrC[lastForcedC])
        }
        // 调整目标大小
        let targetR = m - nAsel - forcedB - forcedC
        pool.resize(targetR)
        // 可行性：强制数量充足且 targetR 在 [0, 候选总数] 之间
        if (forcedB <= nB && forcedC <= nC && targetR >= 0 && targetR <= pool.total) {
            let cand = sA[nAsel] + sB[forcedB] + sC[forcedC] + pool.sumL
            if (cand > ans) {
                ans = cand
            }
        }
        nAsel += 1
    }

    println(ans)
    return 0
}
```

要点：

- 与「战队选人」前作（数方案数、组合数）完全不同，本题是求最大分数和。核心是枚举 $A$ 类选了多少人，把强制项固定下来后，剩下的人用对顶堆动态维护前 $R$ 大之和。
- 对顶堆的关键不变式：$qL$（小根堆）始终持有当前池中最大的 $R$ 个元素，$qR$（大根堆）持有其余；新增元素或调整 $R$ 时只需在两堆之间搬运。维护 $sQ$ 即 $qL$ 的元素和，可在 $O(1)$ 时间内贡献给答案。
- 注意枚举 $nA$ 递增时 $f_B, f_C$ 单调不增，因此「释放」进池的 $B, C$ 元素天然按分数从大到小加入，不需要重新排序；整个算法对每个元素只做常数次堆操作，总复杂度 $O(n \log n)$，$n = 10^6$ 实测最慢点约 $830\text{ ms}$。
