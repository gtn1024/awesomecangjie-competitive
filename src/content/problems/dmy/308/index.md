---
oj: dmy
pid: '308'
title: '[R49F]集合'
difficulty: 省选
tags:
  - 数据结构
  - 树状数组
  - 位运算
  - 离线处理
timeLimit: 3s
memoryLimit: 512m
---

> 数据规模：$Q \le 2 \times 10^5$，$0 \le x < 2^{29}$。

## 思路

把二进制加法按位分析。记 $s_k,x_k$ 分别为 $s,x$ 的第 $k$ 位，$c_k$ 为计算 $s+x$ 时进入第 $k$ 位的进位，其中 $c_0=0$。则

$$
(s+x)_k=s_k\oplus x_k\oplus c_k,
$$

所以 $s$ 与 $s+x$ 的第 $k$ 位不同，当且仅当 $x_k\oplus c_k=1$。

对于 $k\ge 1$，是否产生进位只由低 $k$ 位决定：

$$
c_k=1
\iff
(s\bmod 2^k)+(x\bmod 2^k)\ge 2^k.
$$

令 $r=x\bmod 2^k$，再定义

$$
T_k=
\begin{cases}
2^k-r,&r>0,\\
2^k,&r=0.
\end{cases}
$$

那么 $c_k=1$ 等价于 $s\bmod 2^k\ge T_k$。因此，对固定的 $k$，只需动态维护集合内各元素按 $s\bmod 2^k$ 排序后的出现次数。设当前集合大小为 $m$，其中有 $b$ 个元素满足 $s\bmod 2^k<T_k$，则这一位对答案的贡献为：

- 若 $x_k=1$，需要 $c_k=0$，贡献为 $b$；
- 若 $x_k=0$，需要 $c_k=1$，贡献为 $m-b$。

第 $0$ 位没有进位，若 $x_0=1$，直接贡献当前集合大小。

将全部操作离线读入，并给所有可能被切换的值编号。某个值每次出现于操作 `1` 时，依次对应权值 $+1,-1,+1,-1,\ldots$。对每个 $k=1,2,\ldots,29$：

1. 将所有可能被切换的值按 $s\bmod 2^k$ 排序，并记录每个值的位置；
2. 重新按时间顺序扫描操作，切换时在树状数组中做单点加减；
3. 查询时用树状数组求出排在阈值 $T_k$ 之前的当前元素个数 $b$，再按 $x_k$ 计算这一位的贡献。

还需要避免对每一位重新排序。已按低 $k-1$ 位排好序后，按新加入的第 $k-1$ 位做一次稳定划分，即可得到按低 $k$ 位的顺序。阈值在 $r>0$ 时恰为 $(-x)\bmod 2^k$，所以查询也可对 $2^{30}-x$ 用相同方法逐位稳定划分；$r=0$ 时把阈值单独视作 $2^k$。这样所有离线排序的总时间为线性位数乘操作数。

## 复杂度

记二进制位数 $B=30$。时间复杂度为 $O(BQ\log Q)$，空间复杂度为 $O(Q)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

class Fenwick {
    let n: Int64
    let tree: Array<Int64>

    init(n: Int64) {
        this.n = n
        this.tree = Array<Int64>(n + 1, { _ => 0 })
    }

    func clear(): Unit {
        var i: Int64 = 1
        while (i <= n) {
            tree[i] = 0
            i += 1
        }
    }

    func add(pos0: Int64, delta: Int64): Unit {
        var pos = pos0 + 1
        while (pos <= n) {
            tree[pos] += delta
            pos += pos & (-pos)
        }
    }

    func prefix(count: Int64): Int64 {
        var pos = count
        var result: Int64 = 0
        while (pos > 0) {
            result += tree[pos]
            pos -= pos & (-pos)
        }
        return result
    }
}

func refineOrder(source: Array<Int64>, target: Array<Int64>, keys: Array<Int64>, bit: Int64): Unit {
    let n = source.size
    var zeroCount: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        if ((keys[source[i]] & bit) == 0) {
            zeroCount += 1
        }
        i += 1
    }

    var zeroPos: Int64 = 0
    var onePos = zeroCount
    i = 0
    while (i < n) {
        let id = source[i]
        if ((keys[id] & bit) == 0) {
            target[zeroPos] = id
            zeroPos += 1
        } else {
            target[onePos] = id
            onePos += 1
        }
        i += 1
    }
}

main(): Int64 {
    let reader = getStdIn()
    let q = Int64.parse(reader.readln().getOrThrow())
    let opType = Array<Int64>(q, { _ => 0 })
    let value = Array<Int64>(q, { _ => 0 })
    let eventId = Array<Int64>(q, { _ => -1 })

    let valueToId = HashMap<Int64, Int64>(q)
    let updateList = ArrayList<Int64>()
    let queryList = ArrayList<Int64>()

    var i: Int64 = 0
    while (i < q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let op = line[0]
        let x = line[1]
        opType[i] = op
        value[i] = x
        if (op == 1) {
            if (valueToId.contains(x)) {
                eventId[i] = valueToId.get(x).getOrThrow()
            } else {
                let id = updateList.size
                valueToId[x] = id
                updateList.add(x)
                eventId[i] = id
            }
        } else {
            eventId[i] = queryList.size
            queryList.add(x)
        }
        i += 1
    }

    let updateCount = updateList.size
    let queryCount = queryList.size
    let updateValue = Array<Int64>(updateCount, { j => updateList[j] })
    let queryValue = Array<Int64>(queryCount, { j => queryList[j] })
    let delta = Array<Int64>(q, { _ => 0 })
    let answer = Array<Int64>(queryCount, { _ => 0 })

    let active = Array<Bool>(updateCount, { _ => false })
    var currentSize: Int64 = 0
    i = 0
    while (i < q) {
        if (opType[i] == 1) {
            let id = eventId[i]
            if (active[id]) {
                active[id] = false
                delta[i] = -1
                currentSize -= 1
            } else {
                active[id] = true
                delta[i] = 1
                currentSize += 1
            }
        } else if ((value[i] & 1) != 0) {
            answer[eventId[i]] += currentSize
        }
        i += 1
    }

    var updateOrder = Array<Int64>(updateCount, { j => j })
    var updateBuffer = Array<Int64>(updateCount, { _ => 0 })
    let updatePosition = Array<Int64>(updateCount, { _ => 0 })

    let negativeQuery = Array<Int64>(queryCount, { j => 1073741824 - queryValue[j] })
    var queryOrder = Array<Int64>(queryCount, { j => j })
    var queryBuffer = Array<Int64>(queryCount, { _ => 0 })
    let queryRank = Array<Int64>(queryCount, { _ => 0 })

    let fenwick = Fenwick(updateCount)
    var power: Int64 = 2
    while (power <= 536870912) {
        let nextBit = power / 2
        refineOrder(updateOrder, updateBuffer, updateValue, nextBit)
        let oldUpdateOrder = updateOrder
        updateOrder = updateBuffer
        updateBuffer = oldUpdateOrder

        refineOrder(queryOrder, queryBuffer, negativeQuery, nextBit)
        let oldQueryOrder = queryOrder
        queryOrder = queryBuffer
        queryBuffer = oldQueryOrder

        i = 0
        while (i < updateCount) {
            updatePosition[updateOrder[i]] = i
            i += 1
        }

        let mask = power - 1
        var updatePointer: Int64 = 0
        var j: Int64 = 0
        while (j < queryCount) {
            let queryId = queryOrder[j]
            let threshold = negativeQuery[queryId] & mask
            if (threshold == 0) {
                queryRank[queryId] = updateCount
            } else {
                while (updatePointer < updateCount &&
                    (updateValue[updateOrder[updatePointer]] & mask) < threshold) {
                    updatePointer += 1
                }
                queryRank[queryId] = updatePointer
            }
            j += 1
        }

        fenwick.clear()
        currentSize = 0
        i = 0
        while (i < q) {
            if (opType[i] == 1) {
                let d = delta[i]
                fenwick.add(updatePosition[eventId[i]], d)
                currentSize += d
            } else {
                let queryId = eventId[i]
                let belowThreshold = fenwick.prefix(queryRank[queryId])
                if ((value[i] & power) != 0) {
                    answer[queryId] += belowThreshold
                } else {
                    answer[queryId] += currentSize - belowThreshold
                }
            }
            i += 1
        }

        power *= 2
    }

    let output = StringBuilder()
    i = 0
    while (i < queryCount) {
        output.append(answer[i])
        output.append("\n")
        i += 1
    }
    print(output.toString())
    return 0
}
```
